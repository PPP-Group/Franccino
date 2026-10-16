{{--
    Identidade do painel (marca, títulos e as peças de ajuda). Sem build de CSS próprio: o Filament já entrega as
    cores (--primary-*, --gray-*) e este bloco só acrescenta o que é da Franccino.
--}}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&display=swap">
<style>
    .fr-brand {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 1.35rem;
        font-weight: 600;
        letter-spacing: 0.28em;
        color: var(--gray-950);
        white-space: nowrap;
    }
    .fi-header-heading,
    .fr-welcome__title,
    .fr-tour__title {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-weight: 600;
        letter-spacing: 0.01em;
    }
    .fi-header-heading { font-size: 2rem; line-height: 1.15; }

    .fr-login-note { margin: 0 0 0.5rem; color: var(--gray-600); font-size: 0.875rem; text-align: center; }

    .fr-topbar-help {
        display: inline-flex; align-items: center; gap: 0.375rem; min-height: 2.25rem; padding: 0 0.75rem;
        margin-inline-end: 0.5rem; border-radius: 0.5rem; color: var(--gray-700); font-size: 0.875rem; font-weight: 500;
    }
    .fr-topbar-help:hover, .fr-topbar-help:focus-visible { background: var(--gray-100); color: var(--gray-950); }
    .fr-topbar-help__icon { width: 1.25rem; height: 1.25rem; }
    @media (max-width: 640px) { .fr-topbar-help span { display: none; } }

    .fr-welcome {
        display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1.25rem;
        padding: 1.5rem; border-radius: 0.75rem; background: var(--primary-50);
        border: 1px solid var(--primary-200);
    }
    .fr-welcome__title { margin: 0; font-size: 1.875rem; line-height: 1.2; color: var(--gray-950); }
    .fr-welcome__text { margin: 0.25rem 0 0; max-width: 60ch; color: var(--gray-700); }
    .fr-welcome__actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }

    .fr-shortcuts { display: grid; grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr)); gap: 0.75rem; }
    .fr-shortcut {
        display: flex; align-items: center; gap: 0.75rem; min-height: 4rem; padding: 0.875rem 1rem;
        border-radius: 0.75rem; border: 1px solid var(--gray-200); background: var(--gray-50);
        color: var(--gray-950); font-weight: 500; transition: border-color 150ms, background-color 150ms;
    }
    .fr-shortcut:hover, .fr-shortcut:focus-visible { border-color: var(--primary-500); background: var(--primary-50); }
    .fr-shortcut__icon { width: 1.75rem; height: 1.75rem; flex: none; color: var(--primary-600); }
    .fr-shortcut__label { flex: 1; }

    .fr-help { display: grid; gap: 1.5rem; }
    .fr-help__intro { margin: 0; max-width: 70ch; color: var(--gray-700); font-size: 1rem; }
    .fr-help__toc { display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: 0.75rem; }
    .fr-help__toc-item {
        display: grid; gap: 0.25rem; padding: 0.875rem 1rem; border-radius: 0.75rem;
        border: 1px solid var(--gray-200); background: var(--gray-50); color: var(--gray-950);
    }
    .fr-help__toc-item span { color: var(--gray-600); font-size: 0.875rem; }
    .fr-help__toc-item:hover, .fr-help__toc-item:focus-visible { border-color: var(--primary-500); background: var(--primary-50); }
    .fr-help__guide { scroll-margin-top: 5rem; }
    .fr-help__body { display: grid; gap: 1.5rem; }
    @media (min-width: 1024px) { .fr-help__body:has(.fr-help__video) { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); } }
    .fr-help__video { position: relative; aspect-ratio: 16 / 9; border-radius: 0.75rem; overflow: hidden; background: var(--gray-100); }
    .fr-help__video iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
    .fr-help__label { margin: 0 0 0.5rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--gray-500); }
    .fr-help__steps { margin: 0 0 1.25rem; padding-left: 1.5rem; display: grid; gap: 0.5rem; list-style: decimal; color: var(--gray-800); }
    .fr-help__tips { margin: 0; padding-left: 1.25rem; display: grid; gap: 0.375rem; list-style: disc; color: var(--gray-700); }

    .fr-tour { position: fixed; inset: 0; z-index: 60; display: grid; place-items: center; padding: 1rem; }
    .fr-tour__backdrop { position: absolute; inset: 0; background: rgb(15 15 15 / 0.45); }
    .fr-tour__dialog {
        position: relative; width: min(32rem, 100%); padding: 1.75rem; border-radius: 1rem;
        background: #fff; box-shadow: 0 24px 60px -20px rgb(0 0 0 / 0.35); outline: none;
    }
    .fr-tour__counter { margin: 0; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--primary-600); }
    .fr-tour__title { margin: 0.5rem 0; font-size: 1.75rem; line-height: 1.2; color: var(--gray-950); }
    .fr-tour__body { margin: 0; color: var(--gray-700); line-height: 1.6; }
    .fr-tour__dots { display: flex; gap: 0.375rem; margin: 1.25rem 0; }
    .fr-tour__dot { width: 0.5rem; height: 0.5rem; border-radius: 9999px; background: var(--gray-300); }
    .fr-tour__dot.is-active { width: 1.5rem; background: var(--primary-600); }
    .fr-tour__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
    .fr-tour__spacer { flex: 1; }
</style>
