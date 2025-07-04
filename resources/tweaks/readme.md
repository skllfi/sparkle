# Tweak Guidlines

This is the format for tweaks:

```
resources/
└── tweaks/
    └── example-tweak/
        ├── apply.ps1
        ├── revert.ps1
        └── meta.json
```

## if the tweak does not have a unapply script than dont create a `unapply.ps1`.

the tweak must have a `meta.json` and may have the following properites:

- **name** (`string`)  
   The name of the folder the tweak is in.

- **title** (`string`)  
   The text displayed in the UI.

- **reversible** (`bool`, optional defaults to `true`)  
   Changes the toggle switch in the UI to an apply button.

- **modal** (`string`, optional)  
   Shows the user a modal with that text before applying.

- **category** (`string[]`)  
   Sorts tweaks in the UI.

- **warning** (`string`, optional)  
   Adds an icon to the UI; when the user hovers, it displays the text.

- **restart** (`bool`, optional)  
   Gives the user a message that a restart is required to finish applying the tweak.

- **deep-description** (`string`, optional)  
  Not in use currently but will be used to tell the user what the tweak does

## Tweaks may have the following categories:

- **General**
  A General Tweak

- **Appearance**
  A Tweak that Changes Windows Appearance

- **Performance**
  A Tweak that Increases Windows/Gaming Performance

- **Privacy**
  A Tweak that Increases User Privacy

- **Gaming**
  A Tweak that Increases FPS or for example (sets unneeded services to manual or changes nvidia settings for best performance)

- **Network**
  A Tweak that Changes Network Settings

- **GPU**
  A Tweak that Changes GPU Related Settings
