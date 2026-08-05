const DESIGNER_GITHUB = 'https://github.com/m-tonon';

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-4 px-4 text-center text-xs text-muted-foreground">
      <p>
        © 2026 IPVO • Design by{' '}
        <a
          href={DESIGNER_GITHUB}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground/80 underline-offset-2 hover:text-primary hover:underline"
        >
          Matheus Tonon
        </a>
      </p>
    </footer>
  );
}
