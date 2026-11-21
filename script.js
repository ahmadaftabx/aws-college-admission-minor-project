'use strict';
const form = document.querySelector('#admission-form');
const summary = document.querySelector('#error-summary');
const confirmation = document.querySelector('#confirmation');
const birthDate = document.querySelector('#birthDate');
const today = new Date();
birthDate.max = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
const requiredFields = [...form.querySelectorAll('[required]')];
let attempted = false;
function validationMessage(field) {
  if (field.type === 'checkbox') return field.checked ? '' : 'Please acknowledge that this is a demo application.';
  if (!field.value.trim()) return 'Please complete this field.';
  if (field.id === 'email' && field.validity.typeMismatch) return 'Enter a valid email address, such as alex@example.com.';
  if (field.id === 'phone' && (!/^[+\d\s().-]+$/.test(field.value) || field.value.replace(/\D/g,'').length < 7 || field.value.replace(/\D/g,'').length > 15)) return 'Enter a phone number with 7–15 digits.';
  if (field.id === 'birthDate' && (field.value > birthDate.max || !field.validity.valid)) return 'Enter a valid date of birth that is not in the future.';
  if (field.id === 'graduationYear' && !field.validity.valid) return 'Enter a whole year between 1980 and 2027.';
  if (field.id === 'score' && !field.validity.valid) return 'Enter a percentage from 0 to 100, with up to two decimal places.';
  return field.validity.valid ? '' : 'Please check this value.';
}
function validate(field) {
  const message = validationMessage(field);
  document.getElementById(`${field.id}-error`).textContent = message;
  field.setAttribute('aria-invalid', String(Boolean(message)));
  field.setAttribute('aria-describedby', `${field.id}-error`);
  return !message;
}
function updateSummary() {
  const count = requiredFields.filter(field => validationMessage(field)).length;
  summary.hidden = count === 0;
  summary.textContent = count ? `Please check ${count} required field${count === 1 ? '' : 's'} highlighted below.` : '';
}
requiredFields.forEach(field => {
  field.addEventListener('blur', () => { if (attempted || field.value) validate(field); });
  field.addEventListener('input', () => { if (attempted) { validate(field); updateSummary(); } });
  field.addEventListener('change', () => { if (attempted) { validate(field); updateSummary(); } });
});
form.addEventListener('submit', event => {
  event.preventDefault();
  attempted = true;
  const results = requiredFields.map(validate);
  updateSummary();
  if (results.includes(false)) { summary.focus(); return; }
  document.querySelector('#success-message').textContent = `Thank you, ${form.elements.firstName.value.trim()}! You have completed the admission form demonstration.`;
  document.querySelector('#success-course').textContent = form.elements.course.value;
  form.hidden = true;
  document.querySelector('.required-note').hidden = true;
  confirmation.hidden = false;
  confirmation.focus();
});
document.querySelector('#start-again').addEventListener('click', () => {
  form.reset(); attempted = false;
  requiredFields.forEach(field => { field.removeAttribute('aria-invalid'); document.getElementById(`${field.id}-error`).textContent = ''; });
  confirmation.hidden = true; form.hidden = false;
  document.querySelector('.required-note').hidden = false;
  document.querySelector('#firstName').focus();
});
