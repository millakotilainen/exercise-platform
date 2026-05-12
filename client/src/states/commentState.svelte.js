const STORAGE_KEY = "comments";
const isBrowser = typeof localStorage !== "undefined";

let comments = $state(
  isBrowser ? JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") : []
);

const useCommentState = () => {
  return {
    get count() {
      return comments.length;
    },
    get comments() {
      return comments;
    },
    add: (comment) => {
      comments.push(comment);
      if (isBrowser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
      }
    },
  };
};

export { useCommentState };
