import { useTranslations } from 'next-intl';

/**
 * Tela de abertura (rodada 3, 06/11/2026): na primeira página da sessão, um branco com o nome FRANCCINO que aparece
 * devagar e some quando a página está pronta. Só CSS (motion.css), com o `BootScript` decidindo quando sair; nunca
 * bloqueia cliques depois de sumir, não aparece com movimento reduzido e fica escondida para leitores de tela (o
 * conteúdo da página já está no HTML embaixo dela).
 */
export function SplashScreen() {
  const t = useTranslations('header');
  return (
    <div className="splash" aria-hidden="true">
      <div className="splash__panel">
        <span className="wordmark splash__wordmark">{t('wordmark')}</span>
        <span className="splash__line" />
      </div>
    </div>
  );
}
