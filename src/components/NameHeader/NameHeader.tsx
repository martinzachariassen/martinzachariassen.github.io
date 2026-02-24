import "./NameHeader.css";

export default function NameHeader() {
  return (
    <header className="name-header" aria-label="Site identity">
      <h1 className="name-header__title">Martin Zachariassen</h1>
      <p className="name-header__sub">
        <span className="name-header__role">Back-end developer</span>
        <span className="name-header__sep" aria-hidden="true"> · </span>
        <span className="name-header__desc">Personal homepage — architecture, integrations &amp; production services</span>
      </p>
    </header>
  );
}
