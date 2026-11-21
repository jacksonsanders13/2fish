// Re-mounts on every navigation, so each screen fades in. The fade is plain CSS
// (see .screen-in in globals.css), so a screen still shows up before JavaScript
// loads. Opacity only, so fixed and sticky bars inside aren't affected by a transform.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="screen-in">{children}</div>;
}
