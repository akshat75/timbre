// =====================
// MEMORIES — memories.js
// =====================

const MEMORIES_KEY = 'timbre_memories';

function getMemories() {
  return JSON.parse(localStorage.getItem(MEMORIES_KEY) || '[]');
  }

function saveMemory(memory) {
  const memories = getMemories();
  memories.unshift(memory); // newest first
  localStorage.setItem(MEMORIES_KEY, JSON.stringify(memories));
  updateBadge();
  }

function deleteMemory(id) {
  const memories = getMemories().filter(m => m.id !== id);
  localStorage.setItem(MEMORIES_KEY, JSON.stringify(memories));
  updateBadge();
  }

function updateBadge() {
  const count = getMemories().length;
  document.querySelectorAll('.memories-icon__badge').forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
  }

// Run on every page load
document.addEventListener('DOMContentLoaded', updateBadge);