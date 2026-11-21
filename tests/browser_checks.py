import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
shots = root / 'screenshots'
shots.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH'), headless=True)
    page = browser.new_page(viewport={'width':1440,'height':1000}, device_scale_factor=1)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto('http://127.0.0.1:8765', wait_until='networkidle')
    page.screenshot(path=str(shots/'01-desktop.png'), full_page=True)
    page.locator('.form-card').screenshot(path=str(shots/'03-admission-form.png'))
    page.get_by_role('button', name='Submit demo application').click()
    assert page.locator('#error-summary').is_visible()
    assert page.locator('[aria-invalid=true]').count() == 13
    page.locator('.form-card').screenshot(path=str(shots/'04-form-validation.png'))
    values = {'firstName':'Alex','lastName':'Morgan','birthDate':'2008-05-15','email':'alex@example.com','phone':'+91 98765 43210','address':'123 Sample Street, New Delhi 110001','school':'Example Higher Secondary School','graduationYear':'2026','score':'85.5','statement':'I enjoy solving problems and would love to study computer science.'}
    for name,value in values.items(): page.locator('#'+name).fill(value)
    for name,value in {'qualification':'Higher Secondary / Class 12','course':'B.Tech — Computer Science','studyMode':'Full-time'}.items(): page.locator('#'+name).select_option(label=value)
    page.locator('#consent').check()
    # Invalid email, phone, date and percentage must be rejected.
    for name,value in {'email':'not-an-email','phone':'abc','birthDate':'2099-01-01','score':'101','graduationYear':'2026.5'}.items():
        page.locator('#'+name).fill(value)
        page.get_by_role('button', name='Submit demo application').click()
        assert page.locator('#'+name).get_attribute('aria-invalid') == 'true', name
        page.locator('#'+name).fill(values[name])
    page.get_by_role('button', name='Submit demo application').click()
    assert page.locator('#confirmation').is_visible()
    assert 'Alex' in page.locator('#success-message').inner_text()
    assert page.locator('#admission-form').is_hidden()
    page.locator('.form-card').screenshot(path=str(shots/'05-demo-confirmation.png'))
    page.get_by_role('button', name='Try another demo').click()
    assert page.locator('#firstName').input_value() == ''
    assert page.locator('#error-summary').is_hidden()
    mobile = browser.new_page(viewport={'width':390,'height':844}, device_scale_factor=1, is_mobile=True, has_touch=True)
    mobile.goto('http://127.0.0.1:8765',wait_until='networkidle')
    assert mobile.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    mobile.screenshot(path=str(shots/'02-mobile.png'),full_page=True)
    assert not errors, errors
    print(json.dumps({'status':'passed','screenshots':5,'checks':['required fields','email','phone','future date','score range','whole graduation year','successful confirmation','reset','mobile overflow','no JavaScript errors']}))
    browser.close()
