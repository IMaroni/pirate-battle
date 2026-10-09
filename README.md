Pirate Battle

A naval survival game where you control a ship, avoid islands and fight enemies.

Play online

[Play Pirate Battle](https://exquisite-melba-1e2885.netlify.app)

Run locally

You need Node.js and npm installed.

- Install dependencies: `npm ci`.
- Start the project: `npm run dev`.
- Open the address shown in the terminal.

To run the production version locally, use `npm run build` followed by `npm run preview`.

How to play

Survive until the timer ends. The match also ends if your health reaches zero.

- W / Arrow Up: move forward.
- S / Arrow Down: reverse.
- A / Arrow Left: turn left.
- D / Arrow Right: turn right.
- Space: fire the front weapon.
- Q: fire the left weapon.
- E: fire the right weapon.

You can also use the buttons on the screen.

The front weapon fires one projectile, and each side weapon fires three.

Destroy enemies to earn points. Chasers cause damage on contact, while Shooters fire at your ship.

Use Pause and Resume to pause and continue. Leaving the game window also pauses the match.

Options and results

In Options, you can change the match duration and enemy spawn interval. Your choices are saved in the browser.

Ranking and Match History are available from the main menu.

Match records are stored locally, so they are not shared between different browsers or devices.

Network tests

The APIs are simulated with MSW. You do not need a separate backend.

Open Network tests, choose a scenario and click Apply scenario. You can simulate successful responses, empty results, delays and errors.

Main Menu closes the window without applying changes.

The reset button deletes demo match data, pending submissions and the last result. Game options are preserved.

Project checks

- Check code with ESLint: `npm run lint`.
- Check TypeScript: `npx tsc -b --noEmit`.
- Install Chromium for the tests: `npx playwright install chromium`.
- Build before testing: `npm run build`.
- Run automated tests: `npm run test:pr`.
- Open the interactive test runner: `npm run test:pr:ui`.
- View the test report: `npm run test:report`.

Tests cover selected menu, settings, network and gameplay flows on desktop and mobile screen sizes.

Built with

React, TypeScript, Vite, PixiJS, TanStack Query, Axios, MSW and Playwright.


Known limitations

- Enemies may stop behind islands because they cannot find a path around them.
- Very fast projectiles may miss collisions between updates.

See ARCHITECTURE.md for a brief explanation of how the code works.