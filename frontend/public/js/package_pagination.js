const packages = document.querySelector(".packages");
const packages_observer = new IntersectionObserver(async (entry) => {
  if (entry.length < 0) return;
  const target = entry[0];
  if (!target.isIntersecting) return;

  let q = document.querySelector(".search_query").value;
  const skip = packages.children.length;
  const fetched = await fetch(`/api/v1/packages?skip=${skip}&query=${q}`);
  const json = await fetched.json();
  if (!json.success) return;
  const fetched_packages = json.packages;

  for (let p of fetched_packages) {
    const a = document.createElement("a");
    a.className = "package";
    a.href = `/packages/${p.name}`;

    const package_identifier = document.createElement("div");
    package_identifier.className = "package_identifier";
    a.appendChild(package_identifier);

    const package_name = document.createElement("h1");
    package_name.textContent = p.name;
    package_identifier.appendChild(package_name);

    const package_tags = document.createElement("p");
    package_tags.textContent = p.tags.length == 0 ? "No tags." : p.tags;
    package_identifier.appendChild(package_tags);

    const package_user = document.createElement("p");
    package_user.textContent = p.user.username;
    package_identifier.appendChild(package_user);
    a.appendChild(package_identifier);

    const package_releases = document.createElement("div");
    package_releases.className = "package_releases";
    package_releases.innerHTML = `${p.releases.length} Releases <br>`;
    if (p.releases.length > 0) {
      package_releases.innerHTML += `Latest: (${p.releases[0].release})`;
    }
    a.appendChild(package_releases);
    packages.append(a);
  }

  packages_observer.unobserve(target.target);
  if (fetched_packages.length < 30) return;
  const c = packages.children;
  packages_observer.observe(c[c.length - 1]);
});

if (packages.children.length > 30) {
  packages_observer.observe(packages.children[packages.children.length - 1]);
}
