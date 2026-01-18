const releases = document.querySelector(".releases");
const p_name = releases.getAttribute("package_name");

const releases_observer = new IntersectionObserver(async (entry) => {
  if (entry.length < 0) return;
  const target = entry[0];
  if (!target.isIntersecting) return;

  const fetched = await fetch(
    `/api/v1/releases?skip=${skip}&package_name=${p_name}`,
  );
  const json = await fetched.json();
  if (!json.success) return;
  const fetched_releases = json.releases;

  for (let r of fetched_releases) {
    const release = document.createElement("div");
    release.className = "release";

    const release_name = document.createElement("h1");
    release_name.textContent = r.release;
    release.appendChild(release_name);

    const release_zig_version = document.createElement("p");
    release_zig_version.textContent = `Zig Version: ${r.zig_version}`;
    release.appendChild(release_zig_version);

    const release_root_file = document.createElement("p");
    release_root_file.textContent = `Root File: ${r.root_file}`;
    release.appendChild(release_root_file);

    const release_url = document.createElement("p");
    release_url.className = "url";
    release_url.textContent = `Url (hash): ${r.url.substring(0, 20) + "..." + r.url.substring(r.url.length - 20)}`;

    const release_hash = document.createElement("span");
    release_hash.textContent = `(${r.hash})`;
    release_url.appendChild(release_hash);
    release.appendChild(release_url);
    releases.append(release);
  }

  releases_observer.unobserve(target.target);
  if (fetched_releases.length < 30) return;
  const c = releases.children;
  releases_observer.observe(c[c.length - 1]);
});

if (releases.children.length > 0) {
  releases_observer.observe(releases.children[releases.children.length - 1]);
}
