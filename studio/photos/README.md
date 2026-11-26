# Studio photos — upload here

Drop the original photos for **Thrulenses Studio** into this folder, one
subfolder per shoot:

```
studio/photos/birthday/      ← the birthday session
studio/photos/<next-shoot>/  ← every new shoot gets its own folder
```

On GitHub: open this folder → **Add file → Upload files** → drag the photos in
→ **Commit changes**. To create the shoot subfolder on GitHub, type the folder
name followed by `/` in the file-name box (e.g. `birthday/`) while adding a
file, or just upload into this folder and say which shoot they belong to.

JPG or PNG exports work best (iPhone HEIC: export as JPG first). Full-size
files are fine — the import script resizes them for the web, removes camera
metadata (GPS), files them under `studio/public/media/`, and clears this
folder again.
