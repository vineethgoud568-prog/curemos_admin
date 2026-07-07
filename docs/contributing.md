# Contribution Guide

## Prerequisites

- Ensure you have `node` configured on your machine. Any version `20.x+` will suffice. You can follow the instructions [here](https://nodejs.org/en/download/package-manager).
- Ensure you have `git` installed on your machine. You can follow the instructions [here](https://git-scm.com/download/win). Once `git` is successfully installed on your machine, ensure `git` is configured with your proper credentials so you are able to push and pull code with no issues. You will need to run the following commands:
  - `git config --global user.name "<first-name> <last-name>"`
  - `git config --global user.email "<blueflame-email>"`
- Ensure you have `pnpm` globally installed. Our repository leverages `pnpm` as our package manager, as it handles duplication of dependencies far better than `npm`. You can follow the installation instructions [here](https://pnpm.io/installation).
- You can use any IDE or text editor of your choice, but I would highly recommend [Visual Studio Code](https://code.visualstudio.com/download).

## Getting Setup

1. Clone the repository locally.
2. In the root directory, run `yarn` to install all dependencies for the workspaces.
3. Run `yarn run build`, which triggers build all of our packages.
4. Run `yanr run dev`

## General Flow

When we are working are new features, we will go through the following process:

1. Create a feature branch off of `Dev` to implement the changes on. This branch should follow the naming convention of `feature-<description>`.
2. Create Pull Request on gitlab once changes are ready to be reviewed. Ensure you include the following in the Pull Request:
   - Descriptive Pull Request title
   - A link to the jira issue, if it exists
   - Bullet points describing the major changes
3. We will review the changes and will leave comments, if necessary.
   - If comments are left, it will be communicated to the respective developer and they will be expected to address them.
4. Once all comments are resolved, the branch will be merged. Ensure that when you merge, you squash all of the commits to keep the git tree clean.

We will use the rebasing strategy when it comes to getting the latest changes of `Dev` onto our feature branches. This will also help keep the git tree clean. It is best to rebase right away to avoid large rebases, which can result in difficult to resolve conflicts.

## Linting & Formatting

We are using `eslint` and `prettier` to enforce code quality and formatting. We have a shared configuration that is used across all of our packages.

- To run the linter, you can run `yarn run lint` in the root directory.
- To run the formatter, you can run `yarn run format` in the root directory.
- To run the auto-fixing of lint and formatting issues, you can run `yarn run lint:fix` or `yarn run format:fix` respectively.

- Eslint Plugin for VSCode: [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- Prettier Plugin for VSCode: [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

- Have the following settings in your `settings.json`:

  ```json
  {
    "editor.formatOnSave": true,
    "eslint.workingDirectories": [
      {
        "mode": "auto"
      }
    ]
  }
  ```

## Repository Structure

The project uses a feature-based, colocated structure with Next.js 15 (App Router) and TypeScript. Here is an overview of the main folders:

```txt
src/
├── app/                      # Next.js App Router entry (main pages, layouts, routes)
│   ├── (external)/           # Public/marketing pages
│   ├── (main)/               # Main application layout and dashboard
│   │   └── dashboard/
│   │       ├── default/      # Default dashboard page and components
│   │       └── ...           # Other dashboard pages
│   ├── auth/                 # Authentication pages and components
│   ├── globals.css           # Global styles
│   └── layout.tsx            # Root layout
├── api/                      # API utilities, hooks, and endpoints
│   ├── axiosInstance/
│   ├── hooks/
│   └── endpoints.ts
├── components/               # Shared UI and icon components
│   ├── ui/
│   └── icons/
├── @core/                    # Core components (shared base components)
├── config/                   # Project-wide configuration
├── constants/                # Static values (roles, enums, dummy data)
├── context/                  # React context providers (e.g., AuthContext)
├── hooks/                    # Custom React hooks
├── lib/                      # Library utilities (e.g., React Query provider)
├── middleware/               # Middleware utilities
│   └── middleware.ts
├── module/                   # Feature modules (e.g., auth, user, profile)
│   ├── auth/
│   ├── user/
│   └── profile/
├── navigation/               # Navigation config (sidebar, routes)
│   └── sidebar/
├── types/                    # TypeScript types
│   ├── apps/
│   ├── common/
│   └── forms/
├── utils/                    # Utility/helper functions
│   ├── roles.ts
│   └── routes.ts
```

Other notable folders/files at the root:

- `public/` — Static assets (images, icons)
- `media/` — Media files (e.g., dashboard screenshot)
- `docs/` — Documentation (including this contributing guide)
- `package.json`, `tsconfig.json`, `next.config.mjs`, etc. — Project configuration files

If you add a new feature, create a new folder under `src/module/` or the appropriate section. Keep related components, hooks, and types colocated when possible.

## Styling

It is important that we maintain consistent styles throughout our repository for enhanced readability and ease of other developers to come in and modify any code.
| Rule | Style |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Variables | We should strive to use `const` whereever possible, only falling back to let when absolutely necessary |
| Interfaces | Prefix with `I` |
| Types | Prefix with `T` |
| Files & Folders | Use `kebab-case`. Example: `sub-folder/some-file.ts` |
| Components | Use `I<ComponentName>Props` for prop definition in conjunction with `React.FC` to type the component. We will strictly use function components & hooks |
| Memoization | We should wrap all defined variables and function in `useMemo` and `useCallback` respectively. There will be edge cases to this, so use your best judgement |
