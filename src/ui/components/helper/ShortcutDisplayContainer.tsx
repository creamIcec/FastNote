export default function ShortcutDisplayContainer({
  shortcut,
}: {
  shortcut: string;
}) {
  const splittedShortcut = shortcut.split("+");
  return (
    <div style={{ display: "flex" }}>
      {splittedShortcut.map((k, index) => (
        <>
          <span
            key={k}
            style={{
              backgroundColor: "var(--md-sys-color-surface)",
              borderRadius: "8px",
              padding: "2px",
              width: "fit-content",
              color: "var(--text-color)",
            }}
          >
            {k}
          </span>
          {index < splittedShortcut.length - 1 ? "+" : ""}
        </>
      ))}
    </div>
  );
}
