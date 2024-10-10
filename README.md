# NewRemixTemplate

## Environment set up

todo epic env

## Visual styling

The heirarchy of components goes:

unstyled (functional) component -> styled component variations (e.g. primary button, outline button)

**YOUTUBE ICON MUST BE MIN 20px HEIGHT OTHERWISE IT'S TOS VIOLATION.** The file is named as such to remind you.

## Typing

All incoming data must be bound to a zod type.

We assume that data coming from the DB is valid.

## Code style

No functions will be made like `const blah = () => {}` syntax, use named functions `function blah()`. It's cleaner and easier to read.

If you're doing anything non-obvious (e.g. that requires business or codebase-level context), you should have comments. It's better to have more comments than less as long as they aren't wrong.

Don't use unreadable variable names (e.g. `const a = ...`)

Do not expand React props like `Component({thing}: {thing: string})`. It's overly verbose and makes it more tredious to extend. Plus, it makes it non-obvious whether a variable in the code comes from props or is calculated within the component. Use `Component(props: interface)`.

Additionally, when making a wrapper around a standard component (e.g. a `<button>`), you should use a type union with the original component and pass-through the props so it maintains the same props like:

```tsx
export default function LoaderButton(
  props: {
    children: React.ReactNode
    loading: boolean
    onClick: () => Promise<void>
    ...
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return <button {...props}>{props.children}</button>
}
```

See `LoaderButton` as an example of this.

Log generously, and feel free to use `logger.child` as needed. Generally I like to do it as `let log = logger.child({})`.

## Interfacing with the database

Use the `inTransaction` function to wrap operations in a database transaction. You should _never_ be manually acquiring or releasing pool connections.

All database operations should be created as "transactional functions" which expect a transaction as the first parameter, and use that for interfacing with the database.

This allows us to use nested transactional functions without worrying about whether we are.

You also may _never_ call (or wait for calls) to external services within a transaction. If you must make a call out (e.g. push to frontlink layer), you can do so without awaiting a promise.

Transactional functions should expect that the data being passed in is valid, e.g. it has already been checked with zod.

Use [`sql-migrate`](https://github.com/rubenv/sql-migrate) for migrations.

### Types and transactional functions

Types and transactional functions should always be separated out into separate files. This is because we want to ensure that the transactional functions never make it to the client bundle by using the `.server.ts` suffix, but we still want the types to be accessible by the client.

They should always use the naming scheme:

```
*.server.ts <- transactional functions
*.types.ts  <- types
```

This ensures that the files are next to each other in the file tree.

## State

Instead of using contexts, use `nanostore`s. See [stores.ts](app/stores.ts). These are more ergonomic and don't require insane wrapping everywhere. Plus they are extensible.

## Loaders and Actions

Actions should always expect `application/json` data (except when receiving a file upload, then use `multipart/form-data`).

Both should validate against zod, omitting the file upload. The file upload should be checked for type and size.

Use `<Form>` when the URL should change, otherwise use [`useFetcher`](https://remix.run/docs/en/main/hooks/use-fetcher). You can still collect the information via the `fetcher.Form`, but if for some reason you are managing input state yourself then you should still use the `fetcher.submit` so we can use the loading state management. Make sure to update the method to `POST`.

You can submit a form as JSON, and it will translate it.

And loaders (`GET`) should expect `searchParams`, which should still be validated against zod.

For a given page that might have multiple actions. A top-level action can figure out where to send the JSON to, then send to a function to handle that specific action (e.g. an `action` field in the JSON body/form).
