// Makes user text safe to use inside a regular expression
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default escapeRegex;
