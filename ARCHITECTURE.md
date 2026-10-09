Project structure

- `components`: screens, dialogs and game interface.
- `config`: game settings and gameplay values.
- `game`: movement, keyboard input, combat and visual effects.
- `types`: shared TypeScript interfaces.
- `hooks`: match registration logic.
- `storage`: data saved in the browser.
- `mocks`: simulated API responses and network scenarios.
- `tests`: automated tests with Playwright.

Components have their own CSS files.

React and PixiJS

React handles the menu, options, results and dialogs.

PixiJS draws the arena, ships, projectiles and effects.

GameCanvas connects these two parts. It creates the PixiJS application when the game opens and destroys it when the player leaves.

Game state is stored in TypeScript objects. Ship positions are updated directly in PixiJS. React receives changes to health, score and remaining time for the interface.

Game loop

The PixiJS ticker updates the game every frame.

Each update handles movement, enemy spawning, weapon cooldowns, projectiles, collisions and effects.

Movement uses elapsed time so its speed does not depend directly on the frame rate.

The match ends when time runs out or the player's health reaches zero.

Controls and pause

Keyboard input uses a Set to track pressed keys. Pressing a key adds it, and releasing it removes it.

The game reads these keys during each update, allowing movement and shooting at the same time.

On-screen controls track active touches separately.

Pausing stops game updates. Losing window focus or hiding the page also pauses the match. The player must select Resume to continue.

Pressed inputs are cleared during pauses to avoid stuck commands.

Islands and combat

Islands are placed within configured areas, with some variation between matches.

Ships and projectiles use circular collision checks. Ships cannot enter islands or leave the arena.

Projectiles have a direction, speed, damage and lifetime. They are removed after a hit, expiration or leaving the arena.

Chasers follow the player and cause contact damage. Shooters approach the player, aim and fire.

Destroying an enemy with a player projectile increases the score. Chaser self-destruction does not.

Enemies do not calculate paths around islands, so they can stop behind an obstacle.

Settings and saved data

Options are validated before saving and after loading.

Settings, the last result, confirmed matches and pending submissions are stored in localStorage.

Each match keeps a copy of its selected settings.

Leaving an unfinished match through Main Menu does not register a result.

API requests

Axios sends requests, and TanStack Query handles loading, errors, caching and retries.

Ranking requests include the selected settings and page. History requests include the local player and page.

MSW simulates the APIs in development and production. A separate backend is not required.

Network scenarios can simulate successful responses, empty results, delays and failures.

Match registration

A completed match receives a unique ID and is saved in a pending queue before submission.

Successful submission removes it from the queue. Failed submissions remain available for another attempt, including after refreshing the page.

The simulated API checks the match ID to prevent duplicate records.

Ranking and history queries are refreshed after a successful registration.

Cleanup

Leaving the game removes event listeners and destroys the PixiJS application.

Expired projectiles, defeated enemies and finished effects also have their visual objects removed.

Cancellation checks prevent asynchronous loading from adding objects after the game screen has been closed.

Tests

Playwright tests selected menu, settings, network and gameplay flows.

Gameplay tests use a read-only state bridge enabled by `?testMode=1`. It lets tests inspect the simulation without changing game rules.

These tests use controlled time and repeatable island positions.

The current automated tests cover part of the challenge requirements.