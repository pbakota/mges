# Mini game engine suite (MGES)

Play the game online: https://pbakota.github.io/mges/MiniGame-TS/public/

Mini game engine suite is an attempt to re-create the same minigame in different platforms and languages. Currently, the game is implemented in .NET, TypeScript and Dart, Java, Go, Python3 but Rust, Scala, Pascal, F#, NodeJS is coming also.

The project is started to be an experiment to check .NET SDL2 bindings capabilities, and it turned out very successfully. So, I continued to port the game to other environments.

After I ported the core engine to TypeScript, the first surprising thing was how easy it was to port the game from .NET to TypeScript. I could copy/paste major part of the code and I only had to do minor modifications to make it work.

Porting from TypeScript to Dart was also straightforward.

Java port was easy

Struggled a bit with Go port

The Python port was easy; however, I had to change the way how I render the text. In previous versions, I used pixel-by-pixel rendering, and that was ok for other languages, but not for Python. For Python, it was too slow, so I had to change that part. Now instead of rendering slow pixel-by-pixel, I manipulate the original surface for font preparing all color setup and then render the character glyphs by copying from the prepared surface to another surface, and this is much faster than the previous solution. Maybe I will back port this for other languages as well.

## How to play

The game uses arrow keys for navigation and 'z' key for fire. The game itself is a basic shoot em up;
To start the game in the browser, you have to make an interaction (make a click) in the browser itself. This is a requirement by the browsers.

Title screen

![](figures/2024-03-14_14-47.png)

Game play

![](figures/2024-03-14_14-49.png)

Final score

![](figures/2024-03-14_14-50.png)

## How to build

The project used GNU make files to build targets. 

## .NET version

The .NET uses core version 6.0 and contains SDL-CS2 binding project, and that is because I had to make small modifications.

To build the .NET version

```shell
make
```

To run the .NET version
```shell
make run
```

To make the final package

```shell
make publish
```

This will create Linux and Windows versions.

## TypeScript version

The TypeScript version uses `bun` to compile and run the code.

To build TS version
```shell
make
```

To run TS version
```shell
make serve
```

After this you can visit `http://127.0.0.1:8000` to run the game in your browser

## Dart version

For Dart version is it recommended to install webdev

### To install webdev

```
dart pub global activate webdev
```

To run Dart version
```shell
make run
```

After this a new chrome window should be opened. 

To make the final package
```shell
make build
```

Then the final packaged version can be found in `public` folder.

---

Music credits: Music is from the Amiga version of the game called `Ruff 'n' Tumble` and created by Jason Page

Libraries/tools/assets:

- https://www.libsdl.org/
- https://github.com/flibitijibibo/SDL2-CS
- https://www.kenney.nl/assets/pixel-line-platformer
- https://bun.sh/
- https://dart.dev/

