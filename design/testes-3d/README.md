# Testes de modelo 3D com IA (2026-10-02)

Teste pedido no briefing "LEIA-ME – Briefing dos testes 3D": gerar com IA o modelo 3D de 3 produtos
(Cadeira Marcela, Poltrona Maria, Sofá Campestre), com fidelidade às medidas e textura de qualidade,
para uso como bloco em projetos (SketchUp/Revit) e no visualizador 3D do site.

**Material interno do teste: não publicar nem compartilhar fora do projeto.**

## O que está versionado aqui

| Caminho                                                               | Conteúdo                                                                                                                                 |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/lib_blender.py`                                              | Funções comuns: texturas procedurais (madeira, couro, tecido, lâmina), perfis extrudados, estofados com cantos arredondados, UV em caixa |
| `scripts/marcela.py`, `scripts/maria.py`, `scripts/sofa_campestre.py` | Modelagem de cada peça, na ordem em que rodou (modelagem, ajuste às medidas da ficha, acabamentos)                                       |
| `scripts/render_vista.py`                                             | Render de uma vista para comparar com as fotos                                                                                           |
| `scripts/glb2obj.cjs`                                                 | Conversor `.glb` → `.obj` + `.mtl` + texturas, em milímetros (Node, sem dependências)                                                    |
| `renders/`                                                            | Frente, 3/4 e lateral de cada peça (JPG)                                                                                                 |

**Fora do Git:**

- **`.glb`, `.obj` e `.blend`:** o `.gitignore` do projeto não versiona esses arquivos ("mídia e arquivos pesados vão para o Cloudflare R2").
- **Fotos, fichas técnicas e DWG da Franccino:** são material confidencial.

Esses arquivos estão na pasta de trabalho `produtos-franccino/` do Pedro Silva:

- `Entregas/`, com GLB, OBJ, blend, renders e a nota;
- `Fichas técnicas/`;
- as fotos de cada produto.

No site, o `.glb` entra pelo painel: **Produto → Modelo 3D**, com o "3D" ligado.

## Medidas: ficha × modelo

| Produto                   | Ficha (L × P × A, mm)                            | Modelo (mm)       | GLB    |
| ------------------------- | ------------------------------------------------ | ----------------- | ------ |
| Cadeira Marcela sem braço | 550 × 610 × 850, assento 460                     | 549 × 610 × 850   | 3,5 MB |
| Poltrona Maria            | 715 × 790 × 750, braço 520, assento 440          | 715 × 790 × 750   | 3,2 MB |
| Sofá Campestre 2,00 m     | 2000 × 1000; braço 725, encosto 820, assento 510 | 2000 × 1000 × 907 | 2,5 MB |

As medidas foram conferidas no OBJ exportado. Os três GLB ficam abaixo do limite de 5 MB do visualizador do site, sem Draco.

## Como foi feito

- **Ferramentas:** Claude (Anthropic), via Claude Code. Ele escreveu e executou estes scripts no Blender 5.2 na nuvem, pelo conector 3D Jutsu (Higgsfield), no plano gratuito.
- **Método:** modelagem paramétrica por código, com as medidas das fichas e as proporções lidas nas fotos.
- **Por que não foi "foto → 3D" automático:** o gerador por imagem pede créditos, e a conta tem 0. Também evitamos enviar as fotos confidenciais para um serviço externo.
- **Texturas:** são geradas por algoritmo, **não são os acabamentos reais**.
- **Tempo:** cerca de 1 hora para as três peças, feitas em paralelo.
- **Blender local:** os scripts leem `lib_blender.py` ao lado (`blender -b -P marcela.py`). No teste, rodaram no 3D Jutsu, com a biblioteca guardada como texto dentro do `.blend`. **Não foram testados num Blender local.**

## O que foi deduzido e precisa ser confirmado

- **Marcela:**
  - **Encosto:** o briefing e a foto atual do site mostram encosto de **palhinha**, mas as fotos enviadas mostram encosto estofado em couro. O modelo usa estofado em couro. Se a versão que vale é a de palhinha, troca-se só o encosto (forma e medidas iguais).
  - **Ficha:** a ficha é da versão com braço. A sem braço usa as mesmas medidas.
  - **Travessas baixas:** estão em alturas diferentes (215 e 300 mm), como mostram as fotos; a ficha desenha uma só.
- **Maria:** o briefing cita 700 × 750 × 720, mas a **ficha diz 715 × 790 × 750**. Usei a ficha.
  - **Estrutura:** laterais em madeira maciça (perna dianteira, braço e montante traseiro) e conchas de compensado moldado com lâmina.
  - **Estimativas:** espessuras e inclinações, ajustadas às medidas totais.
- **Sofá:**
  - **Altura total:** com as almofadas soltas, não está na ficha (907 mm, estimado pela foto).
  - **Pés:** a posição e o tamanho dos pés embutidos foram deduzidos.
  - **Capa:** sem rugas nem caimento.
  - **Versão de 2,70 m:** não foi modelada.

## Como ver no site local

O 3D precisa que a mídia (`/storage`) responda com CORS. O `artisan serve` não faz isso, e está registrado como finding no HANDOFF, seção 5.2, item 7.

Para testar localmente:

- suba a API em outra porta (`php artisan serve --port=8010`);
- coloque na porta 8000 um proxy que repasse para ela e acrescente `Access-Control-Allow-Origin`;
- anexe o GLB ao produto pelo painel e abra a página do produto → botão **3D**.

## Verificação no site local (2026-10-02)

Ambiente:

- `develop` (382e0a8) com o catálogo real importado (`franccino:wordpress:import --publish`);
- cada GLB anexado ao produto importado, na coleção `model_3d` com o 3D ligado;
- prints em `prints-site/`.

Medidas lidas pelo próprio visualizador do site (`getDimensions()` do model-viewer):

| Página                                     | Botão 3D | Modelo carregou | Medidas (L × A × P, mm) | GLB                              |
| ------------------------------------------ | -------- | --------------- | ----------------------- | -------------------------------- |
| `/pt/produtos/cadeira-marcela-sem-braco-2` | sim      | sim             | 549 × 850 × 610         | 200, `model/gltf-binary`, 3,5 MB |
| `/pt/produtos/poltrona-maria-2`            | sim      | sim             | 715 × 750 × 790         | 200, `model/gltf-binary`, 3,2 MB |
| `/pt/produtos/sofa-campestre`              | sim      | sim             | 2000 × 907 × 1000       | 200, `model/gltf-binary`, 2,5 MB |

Outros testes:

- Girar arrastando com o mouse funciona.
- Em 375 px (celular), o 3D carrega sem rolagem horizontal, e o visualizador mostra o botão de realidade aumentada.
- Não houve erro do 3D no console.

Achados nas páginas:

- **Marcela:** a descrição e as fotos do site atual mostram o encosto em **tela/palhinha**. O modelo usa o estofado das fotos enviadas.
- **Maria:** a página traz 70 × 75 × 72 cm, vindo do WordPress, mas a ficha diz 71,5 × 79 × 75 cm. Vale corrigir o cadastro.

## Próximos passos sugeridos

1. Confirmar com a Franccino as divergências acima (palhinha e medidas da Maria).
2. Texturas reais: fotos ou escaneamentos dos acabamentos (tauari, couros, tecidos, lâminas).
3. Usar os DWG das fichas para copiar os perfis exatos das peças de madeira.
4. `.skp`: importar o OBJ (mm) no SketchUp. Se a versão não importar OBJ, abra o `.blend` no Blender, exporte em `.dae` e importe no SketchUp.
