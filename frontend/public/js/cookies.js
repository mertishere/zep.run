const create_cookie_wrapper = () => {
  const cookie_wrapper = document.createElement("div");
  cookie_wrapper.className = "cookie_wrapper";

  const cookie_h1 = document.createElement("h1");
  cookie_h1.textContent = "Cookie Preference";
  cookie_wrapper.appendChild(cookie_h1);

  const cookie_p = document.createElement("p");
  cookie_p.textContent =
    "We collect optional cookies. You can choose whether or not to opt-out of these optional cookies. (required cookies are not possible to opt-out of).";
  cookie_wrapper.appendChild(cookie_p);

  const cookie_buttons_wrapper = document.createElement("div");
  cookie_buttons_wrapper.className = "cookie_buttons_wrapper";
  cookie_wrapper.appendChild(cookie_buttons_wrapper);

  const cookie_buttons_reject = document.createElement("button");
  cookie_buttons_reject.className = "cookie_buttons_reject";
  cookie_buttons_reject.textContent = "Reject Optional";
  cookie_buttons_reject.onclick = () => {
    remove_cookie_wrapper();
    set_cookie_preference(0);
  };

  const cookie_buttons_accept = document.createElement("button");
  cookie_buttons_accept.className = "cookie_buttons_accept";
  cookie_buttons_accept.textContent = "Accept Optional";
  cookie_buttons_accept.onclick = () => {
    remove_cookie_wrapper();
    set_cookie_preference(1);
  };
  cookie_buttons_wrapper.appendChild(cookie_buttons_accept);
  cookie_buttons_wrapper.appendChild(cookie_buttons_reject);

  document.body.append(cookie_wrapper);
  setTimeout(() => {
    cookie_wrapper.setAttribute("open", true);
  }, 1000);
};

const set_cookie_preference = (preference) => {
  // 0 or 1, 0 is rejecting optional cookies, and 1 is accepting them.
  document.cookie = `zep_cookie_preference=${preference};`;
};

const get_cookie_preference = () => {
  const cookie_string = document.cookie;
  const cookies = cookie_string.split(";");
  let preference = -1;
  for (let cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (!name.includes("zep_cookie_preference")) continue;
    preference = value;
  }

  return preference;
};

const remove_cookie_wrapper = () => {
  const cookie_wrapper = document.querySelector(".cookie_wrapper");
  cookie_wrapper.removeAttribute("open");
  setTimeout(() => {
    cookie_wrapper.remove();
  }, 1000);
};

const cookie_preference = document.querySelector(".cookie_preference");
cookie_preference.onclick = () => {
  create_cookie_wrapper();
};

if (get_cookie_preference() == -1) {
  create_cookie_wrapper();
}
