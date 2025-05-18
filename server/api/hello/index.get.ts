export default defineEventHandler((event) => {
  const query = getQuery(event);

  const name = query.name || 'anonymous';
  const age = query.age || 'unknown';

  return `Hello ${name}, you are ${age} years old!`;
});