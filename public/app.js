'use strict';
const $ = (id) => document.getElementById(id);
let sessionId;
let busy = false;
let draft;
let candidates = [];
let generation = 0;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function addMessage(text, role = 'assistant') {
  $('messages').append(el('div', `message ${role}`, text));
  $('messages').scrollTop = $('messages').scrollHeight;
}
function setBusy(value) {
  busy = value;
  $('send-button').disabled = value;
  $('message-input').disabled = value;
  $('reset-chat').disabled = value;
  document.querySelectorAll('[data-prompt], .match button, #claim-panel button').forEach(button => { button.disabled = value; });
  $('send-button').firstChild.textContent = value ? 'Thinking… ' : 'Send ';
}
async function api(path, options = {}) {
  const response = await fetch(path, options);
  let body;
  try { body = await response.json(); } catch { throw new Error('The server returned an unreadable response. Please try again.'); }
  if (!response.ok) throw new Error(body.error || 'Something went wrong. Please try again.');
  return body;
}
function renderMatches() {
  if (!candidates.length) return;
  $('matches').replaceChildren();
  candidates.forEach(item => {
    const card = el('article', 'match');
    card.append(el('h3', '', item.description), el('p', '', `Found near ${item.location}`), el('p', '', `Found: ${item.foundDate}`));
    const button = el('button', 'text-button', 'This might be mine →');
    button.type = 'button';
    button.disabled = busy;
    button.addEventListener('click', () => sendMessage(`The ${item.description} (${item.id}) might be mine. What details should I provide for a claim?`));
    card.append(button);
    $('matches').append(card);
  });
}
function renderDraft() {
  if (!draft) return;
  const panel = $('claim-panel');
  panel.hidden = false;
  panel.replaceChildren(el('span', 'section-label', 'READY FOR REVIEW'), el('h2', '', 'Send your claim?'));
  const item = candidates.find(candidate => candidate.id === draft.itemId);
  panel.append(el('p', '', `Your description and identifying details will be sent to staff${item ? ` for: ${item.description}` : ''}. Staff will decide the next step. This does not confirm ownership.`));
  const button = el('button', 'primary', 'Submit claim for staff review');
  button.type = 'button';
  button.addEventListener('click', submitClaim);
  panel.append(button);
}
async function sendMessage(message) {
  if (busy || !message.trim()) return;
  const turnGeneration = generation;
  addMessage(message.trim(), 'user');
  $('message-input').value = '';
  $('suggestions').hidden = true;
  setBusy(true);
  $('activity').textContent = 'Looking into it…';
  try {
    const result = await api('/api/chat', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({sessionId, message:message.trim()})});
    if (turnGeneration !== generation) return;
    sessionId = result.sessionId;
    addMessage(result.message || 'Tell me a little more about your item.');
    if (Array.isArray(result.candidates) && result.candidates.length) { candidates = result.candidates; renderMatches(); }
    $('activity').textContent = Array.isArray(result.activity) ? result.activity.join(' · ') : '';
    if (result.claimDraft) { draft = result.claimDraft; renderDraft(); }
  } catch (error) {
    addMessage(error.message, 'assistant error');
    $('activity').textContent = 'Your last message could not be completed. Try again.';
  } finally {
    setBusy(false);
    $('message-input').focus();
  }
}
async function submitClaim() {
  if (busy || !draft || !sessionId) return;
  setBusy(true);
  try {
    const result = await api('/api/claims', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({sessionId, itemId:draft.itemId})});
    const panel = $('claim-panel');
    panel.replaceChildren(el('span', 'section-label', 'CLAIM RECEIVED'), el('h2', '', 'Pending staff review'), el('p', '', 'Your claim is saved in this prototype for staff to review. It does not reserve the item or confirm ownership.'), el('p', 'receipt-id', `Claim ${result.claimId}`));
    addMessage('Your claim has been submitted for staff review. Keep the claim reference shown beside this conversation.');
    draft = undefined;
  } catch (error) { addMessage(error.message, 'assistant error'); }
  finally { setBusy(false); }
}
function resetChat() {
  if (busy) return;
  generation++;
  sessionId = undefined; draft = undefined; candidates = [];
  $('messages').replaceChildren(); $('activity').textContent = '';
  $('claim-panel').hidden = true; $('claim-panel').replaceChildren();
  $('matches').replaceChildren();
  const empty = el('div', 'empty-state');
  empty.append(el('span', '', '⌕'), el('p', '', 'Your matches will appear here.\nStart with the item, place, and approximate time.'));
  $('matches').append(empty);
  $('suggestions').hidden = false;
  $('message-input').value = '';
  addMessage('Hey, Badger. Let’s get it back to you.\n\nWhat did you lose, and where and when did you last see it?');
}
function lockStaff() {
  $('staff-token').value = '';
  $('staff-claims').replaceChildren();
  $('staff-status').textContent = '';
}
function showView(view) {
  const student = view === 'student';
  $('student-view').hidden = !student; $('staff-view').hidden = student;
  $('student-tab').classList.toggle('active', student); $('staff-tab').classList.toggle('active', !student);
  $('student-tab').setAttribute('aria-pressed', String(student)); $('staff-tab').setAttribute('aria-pressed', String(!student));
  if (student) lockStaff();
}
function renderStaffClaim(claim) {
  const card = el('article', 'staff-claim');
  card.append(el('span', 'pending', 'Pending review'), el('h3', '', claim.item?.description || claim.itemId), el('p', 'staff-meta', `Claim ${claim.claimId || claim.id} · ${claim.createdAt ? new Date(claim.createdAt).toLocaleString() : ''}`));
  card.append(el('h4', '', 'Student’s original messages'));
  const evidence = el('ul');
  (claim.evidence || []).forEach(entry => evidence.append(el('li', '', typeof entry === 'string' ? entry : entry.message)));
  card.append(evidence, el('h4', '', 'Private inventory details · Staff only'));
  const details = claim.item?.privateDetails;
  card.append(el('p', 'private-note', typeof details === 'string' ? details : Array.isArray(details) ? details.join('\n') : JSON.stringify(details || {}, null, 2)));
  if (claim.item) card.append(el('p', '', `${claim.item.location} · Found ${claim.item.foundDate}`));
  card.append(el('p', 'staff-meta', 'Demo review only. No item release or automatic ownership decision.'));
  return card;
}
$('chat-form').addEventListener('submit', event => { event.preventDefault(); sendMessage($('message-input').value); });
$('message-input').addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage($('message-input').value); } });
document.querySelectorAll('[data-prompt]').forEach(button => button.addEventListener('click', () => sendMessage(button.dataset.prompt)));
$('reset-chat').addEventListener('click', resetChat);
$('student-tab').addEventListener('click', () => showView('student'));
$('staff-tab').addEventListener('click', () => showView('staff'));
$('staff-lock').addEventListener('click', lockStaff);
$('staff-form').addEventListener('submit', async event => {
  event.preventDefault();
  const token = $('staff-token').value.trim();
  if (!token) return;
  $('staff-claims').replaceChildren(); $('staff-status').textContent = 'Loading claims…';
  const button = event.submitter;
  if (button) button.disabled = true;
  try {
    const result = await api('/api/staff/claims', {headers:{Authorization:`Bearer ${token}`}});
    const claims = Array.isArray(result) ? result : result.claims || [];
    if ($('staff-view').hidden || $('staff-token').value.trim() !== token) return;
    claims.forEach(claim => $('staff-claims').append(renderStaffClaim(claim)));
    $('staff-status').textContent = claims.length ? `${claims.length} claim${claims.length === 1 ? '' : 's'} awaiting review.` : 'No claims yet. Submit one from the student view first.';
  } catch (error) { $('staff-status').textContent = error.message; }
  finally { if (button) button.disabled = false; }
});
resetChat();
