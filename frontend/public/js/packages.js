const search_query = document.querySelector(".search_query");
const search_wrapper = document.querySelector(".search_wrapper");
search_wrapper.onsubmit = (e) => {
  e.preventDefault();
  window.location.href = `/packages?query=${search_query.value}`;
};

if (search_query.value.length > 0) {
  search_query.focus();
  setTimeout(function () {
    search_query.selectionStart = search_query.selectionEnd = 10000;
  }, 0);
}
