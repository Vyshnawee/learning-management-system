// "Intro to React & Node!" -> "intro-to-react-node"
const slugify = (text) => {
     return text
          .toString()
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
};

export default slugify;
