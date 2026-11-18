{{--
    Identidade do painel (marca, títulos e as peças de ajuda). Sem build de CSS próprio: o Filament já entrega as
    cores (--primary-*, --gray-*) e este bloco só acrescenta o que é da Franccino.
--}}
<style>
    /*
        Visual do site no painel (revisão de 17/11/2026: "tem que ficar muito parecido com o próprio site"). Regras do
        site (web/DESIGN.md): Jost em tudo, preto no branco, cantos retos, sem sombra, linhas finas, fundo areia para
        separar áreas e espaços na grade de 4 px. A fonte vem do `->font('Jost')` do painel.
    */
    :root {
        --radius-sm: 0;
        --radius-md: 0;
        --radius-lg: 0;
        --radius-xl: 0;
        --fr-ink: #171717;
        --fr-muted: #57564f;
        --fr-line: #dcd9d1;
        --fr-sand: #f4efe6;
        --fr-sand-soft: #faf8f4;
        --fr-wood: #7b4b2a;
    }
    /* Sem sombra em lugar nenhum: as linhas finas (os "rings") continuam separando os blocos. */
    .fi-body * { --tw-shadow: 0 0 #0000 !important; --tw-drop-shadow: none !important; }
    .fi-body { background: var(--fr-sand-soft); color: var(--fr-ink); }
    .fi-sidebar, .fi-topbar > nav, .fi-topbar { background: #fff; }
    .fi-sidebar { border-inline-end: 1px solid var(--fr-line); }
    .fi-topbar > nav { border-bottom: 1px solid var(--fr-line); box-shadow: none; }

    .fr-brand { display: inline-flex; align-items: center; color: var(--fr-ink); }
    .fr-brand__logo { display: block; height: 1rem; width: auto; }
    .fi-simple-main .fr-brand__logo { height: 1.375rem; }

    /* Títulos como os do site: Jost leve, sem negrito, letras levemente fechadas. */
    .fi-header-heading,
    .fr-welcome__title,
    .fr-tour__title,
    .fi-simple-header-heading {
        font-weight: 400;
        letter-spacing: -0.01em;
        color: var(--fr-ink);
    }
    .fi-header-heading { font-size: 2rem; line-height: 1.15; }
    .fi-section-header-heading, .fi-modal-heading { font-weight: 500; letter-spacing: 0; }
    /* Rótulos de grupo do menu em versalete, como os metadados do site. */
    .fi-sidebar-group-label { font-size: 0.75rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fr-muted); }
    .fi-sidebar-item-btn { border-radius: 0; }
    .fi-sidebar-item.fi-active .fi-sidebar-item-btn { background: var(--fr-sand); }
    .fi-sidebar-item.fi-active .fi-sidebar-item-label, .fi-sidebar-item.fi-active .fi-sidebar-item-icon { color: var(--fr-ink); }
    /* Botões principais em preto, texto branco e cantos retos, como "Aceitar todos" do site. */
    .fi-btn { font-weight: 500; letter-spacing: 0.01em; }

    /* O painel é feito para o computador: no celular, um aviso no topo (o que dá para fazer continua funcionando). */
    .fr-desktop-note { display: none; }
    @media (max-width: 767px) {
        .fr-desktop-note {
            display: block; margin: 0 0 1rem; padding: 0.75rem 1rem; border: 1px solid var(--fr-line);
            background: var(--fr-sand); color: var(--fr-ink); font-size: 0.875rem; line-height: 1.5;
        }
    }

    .fr-login-note { margin: 0 0 0.5rem; color: var(--gray-600); font-size: 0.875rem; text-align: center; }

    .fr-topbar-help {
        display: inline-flex; align-items: center; gap: 0.375rem; min-height: 2.25rem; padding: 0 0.75rem;
        margin-inline-end: 0.5rem; border-radius: 0; color: var(--gray-700); font-size: 0.875rem; font-weight: 500;
    }
    .fr-topbar-help:hover, .fr-topbar-help:focus-visible { background: var(--gray-100); color: var(--gray-950); }
    .fr-topbar-help__icon { width: 1.25rem; height: 1.25rem; }
    @media (max-width: 640px) { .fr-topbar-help span { display: none; } }

    .fr-welcome {
        display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1.25rem;
        padding: 1.5rem; background: var(--fr-sand);
        border: 1px solid var(--fr-line);
    }
    .fr-welcome__title { margin: 0; font-size: 1.875rem; line-height: 1.2; color: var(--gray-950); }
    .fr-welcome__text { margin: 0.25rem 0 0; max-width: 60ch; color: var(--gray-700); }
    .fr-welcome__actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }

    .fr-shortcuts { display: grid; grid-template-columns: repeat(var(--fr-cols, 4), minmax(0, 1fr)); gap: 0.75rem; }
    @media (max-width: 767px) { .fr-shortcuts { grid-template-columns: repeat(2, minmax(0, 1fr)); } .fr-shortcuts > * { grid-column: auto !important; } }
    .fr-shortcut {
        display: flex; align-items: center; gap: 0.75rem; min-height: 4rem; padding: 0.875rem 1rem;
        border: 1px solid var(--fr-line); background: #fff;
        color: var(--gray-950); font-weight: 500; transition: border-color 150ms, background-color 150ms;
    }
    .fr-shortcut:hover, .fr-shortcut:focus-visible { border-color: var(--fr-ink); background: var(--fr-sand); }
    .fr-shortcut__icon { width: 1.5rem; height: 1.5rem; flex: none; color: var(--fr-wood); }
    .fr-shortcut__label { flex: 1; }

    /* Uploads (revisão de 17/11/2026): fotos em quadrados pequenos lado a lado, sobre a areia, sem esticar; o nome do
       arquivo some (fica o tamanho); vídeo e 3D numa faixa estreita, com a prévia do vídeo baixa. */
    .fr-upload--photo .filepond--root[data-style-panel-layout=grid] .filepond--item { width: 10.5rem !important; }
    .fr-upload--photo .filepond--image-preview-wrapper, .fr-upload--photo .filepond--image-preview { background: var(--fr-sand); }
    .fr-upload--photo .filepond--file-info-main { display: none; }
    .fr-upload--photo .filepond--image-preview-overlay-idle { display: none; }
    .fr-upload--photo .filepond--file-info { color: var(--fr-ink); text-shadow: none; }
    .fr-upload--photo .filepond--image-preview-wrapper, .fr-upload--photo .filepond--item > fieldset { border-radius: 0; }
    .fr-upload--photo .filepond--item-panel { border-radius: 0; }
    .fr-upload--file .filepond--root { max-width: 32rem; }
    .fr-upload--file video, .fr-upload--file .filepond--media-preview-wrapper { max-height: 12rem; }
    .fr-upload .filepond--panel-root { border-radius: 0; background: #fff; border: 1px dashed var(--fr-line); }
    .fr-upload .filepond--drop-label { min-height: 4rem; }

    /* API e conectores (revisão de 17/11/2026: espaçamento, texto amontoado e fontes diferentes). */
    .fr-api { display: grid; gap: 1.25rem; }
    .fr-api .fi-tabs { justify-self: start; margin-inline: 0; }
    .fr-api__address, .fr-api__docs { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
    .fr-api__label { font-size: 0.75rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fr-muted); }
    .fr-api__url { padding: 0.375rem 0.75rem; background: var(--fr-sand); border: 1px solid var(--fr-line); font-size: 0.875rem; word-break: break-all; }
    .fr-api__steps { margin: 0; padding: 0; list-style: none; counter-reset: fr-step; display: grid; gap: 0.875rem; }
    .fr-api__steps li { counter-increment: fr-step; position: relative; min-height: 1.75rem; padding: 0.125rem 0 0 2.5rem; line-height: 1.6; font-size: 0.9375rem; }
    .fr-api__steps li::before { content: counter(fr-step); position: absolute; left: 0; top: 0; display: grid; place-items: center; width: 1.75rem; height: 1.75rem; background: var(--fr-ink); color: #fff; font-size: 0.8125rem; font-weight: 500; }
    .fr-api__steps strong, .fr-api__tips strong { font-weight: 500; }
    .fr-api__tips { margin: 0; padding-left: 1.125rem; list-style: disc; display: grid; gap: 0.5rem; line-height: 1.6; font-size: 0.9375rem; }

    .fr-help { display: grid; gap: 2.5rem; }
    .fr-help__index { display: grid; gap: 2.5rem; }
    .fr-help__top { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 1rem; }
    .fr-help__intro { margin: 0; max-width: 70ch; color: var(--fr-muted); font-size: 1rem; line-height: 1.6; }
    .fr-help__group { display: grid; gap: 1rem; }
    .fr-help__group-title { margin: 0; font-size: 0.75rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fr-muted); }
    .fr-help__cards { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0.75rem; }
    /* Sem buraco na última linha: o último cartão ocupa o que sobra (revisão de 17/11/2026, "cards dinâmicos"). */
    @media (min-width: 768px) and (max-width: 1279px) {
        .fr-help__cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .fr-help__cards > :last-child:nth-child(2n + 1) { grid-column: span 2; }
    }
    @media (min-width: 1280px) {
        .fr-help__cards { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .fr-help__cards > :last-child:nth-child(3n + 1) { grid-column: span 3; }
        .fr-help__cards > :last-child:nth-child(3n + 2) { grid-column: span 2; }
    }
    .fr-help__card {
        display: flex; align-items: flex-start; gap: 0.875rem; padding: 1rem 1.125rem; text-align: left;
        border: 1px solid var(--fr-line); background: #fff; color: var(--fr-ink); cursor: pointer;
        transition: border-color 150ms, background-color 150ms;
    }
    .fr-help__card:hover, .fr-help__card:focus-visible { border-color: var(--fr-ink); background: var(--fr-sand); }
    .fr-help__card-icon { width: 1.5rem; height: 1.5rem; flex: none; margin-top: 0.125rem; color: var(--fr-wood); }
    .fr-help__card-text { display: grid; gap: 0.25rem; flex: 1; }
    .fr-help__card-text strong { font-weight: 500; }
    .fr-help__card-text span { color: var(--fr-muted); font-size: 0.875rem; line-height: 1.5; }

    .fr-help__guide { display: grid; gap: 1.75rem; max-width: 68rem; }
    .fr-help__back { display: inline-flex; align-items: center; gap: 0.5rem; justify-self: start; color: var(--fr-muted); font-size: 0.875rem; }
    .fr-help__back:hover, .fr-help__back:focus-visible { color: var(--fr-ink); text-decoration: underline; }
    .fr-help__back-icon { width: 1rem; height: 1rem; }
    .fr-help__guide-head { display: grid; grid-template-columns: auto 1fr auto; align-items: start; gap: 1rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--fr-line); }
    .fr-help__guide-icon { width: 2rem; height: 2rem; color: var(--fr-wood); }
    .fr-help__guide-title { margin: 0; font-size: 1.75rem; font-weight: 400; line-height: 1.2; }
    .fr-help__guide-summary { margin: 0.375rem 0 0; color: var(--fr-muted); }
    @media (max-width: 767px) { .fr-help__guide-head { grid-template-columns: auto 1fr; } .fr-help__open { grid-column: 1 / -1; justify-self: start; } }
    .fr-help__body { display: grid; gap: 2rem; }
    @media (min-width: 1024px) { .fr-help__body { grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); } }
    .fr-help__label { margin: 0 0 0.75rem; font-size: 0.75rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fr-muted); }
    .fr-help__steps { margin: 0; padding: 0; list-style: none; display: grid; gap: 0.875rem; counter-reset: none; }
    .fr-help__steps li { display: grid; grid-template-columns: 2rem 1fr; gap: 0.75rem; align-items: start; line-height: 1.6; color: var(--fr-ink); }
    .fr-help__step-number { display: grid; place-items: center; width: 2rem; height: 2rem; background: var(--fr-ink); color: #fff; font-size: 0.875rem; font-weight: 500; }
    .fr-help__side { display: grid; gap: 1.25rem; align-content: start; }
    .fr-help__tips-box { padding: 1.25rem; background: var(--fr-sand); border: 1px solid var(--fr-line); }
    .fr-help__tips { margin: 0; padding-left: 1.125rem; display: grid; gap: 0.5rem; list-style: disc; color: var(--fr-ink); line-height: 1.55; }
    .fr-help__video { position: relative; aspect-ratio: 16 / 9; overflow: hidden; background: var(--fr-sand); }
    .fr-help__video iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }

    .fr-tour { position: fixed; inset: 0; z-index: 60; display: grid; place-items: center; padding: 1rem; }
    .fr-tour__backdrop { position: absolute; inset: 0; background: rgb(15 15 15 / 0.45); }
    .fr-tour__dialog {
        position: relative; width: min(32rem, 100%); padding: 1.75rem; border-radius: 0;
        background: #fff; box-shadow: 0 24px 60px -20px rgb(0 0 0 / 0.35); outline: none;
    }
    .fr-tour__counter { margin: 0; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--primary-600); }
    .fr-tour__title { margin: 0.5rem 0; font-size: 1.75rem; line-height: 1.2; color: var(--gray-950); }
    .fr-tour__body { margin: 0; color: var(--gray-700); line-height: 1.6; }
    .fr-tour__dots { display: flex; gap: 0.375rem; margin: 1.25rem 0; }
    .fr-tour__dot { width: 0.5rem; height: 0.5rem; background: var(--gray-300); }
    .fr-tour__dot.is-active { width: 1.5rem; background: var(--primary-600); }
    .fr-tour__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
    .fr-tour__spacer { flex: 1; }
</style>
