# main.tsx

## 📄 Descrição

Arquivo de entrada principal da aplicação React. Responsável por renderizar o componente raiz `App` dentro de um `StrictMode` para desenvolvimento com verificações mais rigorosas do React. Este é o ponto de entrada da aplicação que será executado quando o HTML carregar.

---

## ⚙️ Estrutura do Código

O arquivo importa:

- `StrictMode` do React - habilita verificações adicionais durante o desenvolvimento
- `createRoot` do React DOM - API moderna para renderização
- `App` - componente principal da aplicação
- `index.css` - estilos globais

---

## 🚀 Funcionalidade

1. Seleciona o elemento DOM com id `root` do HTML
2. Cria uma raiz React usando `createRoot`
3. Renderiza o componente `App` dentro de `StrictMode`

---

## 🔗 Dependências

- React 19.1.1
- React DOM 19.1.1
- Vite (bundler/build tool)

---

## 🔗 Links Relacionados

- [App.tsx](./App.md)
- [index.css](../src/index.css)

