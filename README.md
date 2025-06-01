Below is a step-by-step guide that assumes you have downloaded (or cloned) the project into your **Downloads** folder. We’ll walk through:

1. Placing the project folder in Downloads
2. Installing and running the back-end server
3. Installing and running the Expo (React Native) front-end
4. Opening the app on your phone via Expo Go

All commands assume a Windows environment (PowerShell or Command Prompt).

_You may encounter a "Running scripts is disabled on this system" error. Please read **Section 6: Common Troubleshooting** on how to overcome this if needed._

## 1. Get the `orbital-main-2025` Folder into Downloads

If you haven’t yet obtained the project code, follow one of these two options:

### A. Download the ZIP via Browser

1. Open your web browser and go to the GitHub page:

   ```
   https://github.com/JordanTwz/orbital-main-2025
   ```
2. Click the green **Code** button → choose **Download ZIP**.
3. A file named `orbital-main-2025-master.zip` (or similar) will appear in your **Downloads** folder.
4. Open **File Explorer** and go to:

   ```
   C:\Users\<YourUserName>\Downloads
   ```
5. Right-click the ZIP file (`orbital-main-2025-master.zip`) → **Extract All…** → by default it will extract into a folder named `orbital-main-2025-master`.
6. Rename that extracted folder to exactly:

   ```
   orbital-main-2025
   ```

   so that you end up with:

   ```
   C:\Users\<YourUserName>\Downloads\orbital-main-2025
   ```

### B. (Alternative) Clone with Git

> *Only do this if you have Git installed. If you’re not sure, skip to option A above.*

1. Open **PowerShell** (Start → type "PowerShell" → Enter).
2. Change directory to Downloads:

   ```powershell
   cd $env:USERPROFILE\Downloads
   ```
3. Run:

   ```powershell
   git clone https://github.com/JordanTwz/orbital-main-2025.git
   ```

   This will create a folder:

   ```
   C:\Users\<YourUserName>\Downloads\orbital-main-2025
   ```

Whichever method you used, you should now have a folder:

```
C:\Users\<YourUserName>\Downloads\orbital-main-2025
```

## 2. Install and Run the Back-End Server

Inside `orbital-main-2025`, there is a `server` subfolder that needs its own setup.

1. **Open a new PowerShell window** (so you can keep it open while the server runs).

2. Change directory to the `server` folder:

   ```powershell
   cd $env:USERPROFILE\Downloads\orbital-main-2025\server
   ```

3. **Install server dependencies** by running:

   ```powershell
   npm install
   ```

   You should see `node_modules` appear under `...\orbital-main-2025\server` and a `package-lock.json` file.

4. **Create a `.env` file** to hold your OpenAI key:

   1. In File Explorer, navigate to:

      ```
      C:\Users\<YourUserName>\Downloads\orbital-main-2025\server
      ```
   2. Right-click → **New** → **Text Document**. Name it (exactly):

      ```
      .env
      ```

      (Make sure it does **not** end up as `.env.txt`. If Windows appends ".txt," rename it so that the extension is only `.env`.)
   3. Open that `.env` in Notepad. Paste in exactly:

      ```
      OPENAI_API_KEY=YOUR_OPENAI_KEY_HERE
      ```

      - Replace `YOUR_OPENAI_KEY_HERE` with the secret key you get from [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)
      - Save and close Notepad.

5. **Find your PC’s local IPv4 address** (so the mobile app can contact this server):

   1. In the same PowerShell window (or a separate one), run:

      ```powershell
      ipconfig
      ```
   2. Scroll until you see an adapter under "Wireless LAN adapter Wi-Fi" (or "Ethernet adapter" if using Ethernet). Look for the line:

      ```
      IPv4 Address . . . . . . . . . . . : 192.168.x.y
      ```

      - Note that value (for example, `192.168.1.42`). That is your PC’s LAN IP.

6. **Edit `MealLogScreen.tsx` to point at your IP**:

   1. In File Explorer, navigate to:

      ```
      C:\Users\<YourUserName>\Downloads\orbital-main-2025\screens
      ```
   2. Right-click **MealLogScreen.tsx** → **Open with** → Notepad (or your text editor).
   3. Near the top you’ll see:

      ```ts
      const SERVER = 'http://192.168.XX.XX:3000'
      ```
   4. Replace `192.168.XX.XX` with the IPv4 you found. For instance, if it was `192.168.1.42`, edit it to:

      ```ts
      const SERVER = 'http://192.168.1.42:3000'
      ```
   5. Save and close the file.

7. **Start the back-end server**:

   1. In the PowerShell window (in `...\orbital-main-2025\server`), run:

      ```powershell
      node index.js
      ```
   2. You should see:

      ```
      OPENAI_API_KEY loaded: true
      Server listening on port 3000
      ```
   3. **Keep this window open**. Closing it will stop the server.

At this point, your back-end is live on `http://<YourIPv4>:3000`. e.g., `http://192.168.1.42:3000`.

## 3. Install and Run the Expo Front-End

You’ll now launch the React Native app via Expo so your phone can connect.

1. **Open a second PowerShell window** (so the server window stays open).

2. Change directory to the project root (one level above `server`):

   ```powershell
   cd $env:USERPROFILE\Downloads\orbital-main-2025
   ```

3. **Install front-end dependencies**:

   ```powershell
   npm install
   ```

   - This reads the top-level `package.json` and installs everything under `node_modules` (Expo, React Native, Firebase, etc.).

4. **Start Expo**:

   ```powershell
   npx expo start
   ```

   Make sure it shows something like:

    ```
    Metro Bundler ready - press "a" to open Android emulator, "i" for iOS simulator, or scan the QR code with your phone.
    ```

   - Leave this window open during development.


## 4. Run the App on Your Phone with Expo Go

1. **Ensure your phone** (Android or iOS) is connected to the **same Wi-Fi network** as your Windows PC.
2. On your phone, open **Expo Go** (app store installation required beforehand).
3. Scan the QR code with the "Scan QR code" feature inside Expo Go.
4. After scanning, Expo Go will download the JavaScript bundle from your PC and launch the MealCraft app.
   * You should see a **Sign In** screen. If you do not, check that Metro bundler shows no errors.

## 5. Verify Everything Is Working

1. **Sign Up / Sign In**

   * If you have no account yet, tap **"Sign Up"** and create one.
   * Otherwise, use **"Sign In"** with existing credentials.
   * Successful authentication navigates you to the **Home** screen (which has "MealCraft" at the top).

2. **Test Meal Logging**

   * On **Home**, tap **"Log a Meal"**.
   * Grant permission when prompted (so Expo Go can access your photos).
   * Tap the large photo box ("Tap to add a photo") and choose any image from your phone’s gallery.
   * After selecting, tap **"Analyze Meal"**.
   * The app will display a loading spinner while it sends the image to `http://<YourIPv4>:3000/analyze`.
   * If the server and your IP are configured correctly, you will see an **Analysis** card with a short description, total calories, and an expandable list of dish macros.

## 6. Common Troubleshooting

* **"Network request failed" or "Failed to fetch" when tapping Analyze Meal**

  * Ensure the **server terminal** (where you ran `node index.js`) is still open and shows no errors.
  * Double-check the IP inside `MealLogScreen.tsx` matches your PC’s actual IPv4 (run `ipconfig` again if unsure).
  * Confirm your phone and PC are on the **same Wi-Fi subnet** (e.g., both IPs start with `192.168.1.x`).
 
* **"Running scripts is disabled on this system" error**

  * This happens when Windows restricts script execution. To fix it:
  * Open PowerShell as Administrator.
  * Run this command:

    ```batch
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
    ```

  * Try running `npx expo start` again in a new terminal, **following Step 3.2 and 3.4.**

* **`.env` not loading / `OPENAI_API_KEY loaded: false`**

  * Confirm `.env` sits at:

    ```
    C:\Users\<YourUserName>\Downloads\orbital-main-2025\server\.env
    ```
  * Its contents must be exactly:

    ```
    OPENAI_API_KEY=sk-…your_openai_key…
    ```

    with no extra spaces.
  * If you modified or created `.env` after already running `node index.js`, **stop** the server (Ctrl+C) and re-run `node index.js` so that dotenv picks it up.

* **Expo DevTools fails to open or Metro errors**

  * Make sure you ran `npm install` in the root (`…\orbital-main-2025`).
  * Ensure you do `npx expo start` from the **project root**, not inside `server`.

* **"Permission denied" when picking an image**

  * On your phone, go to Settings → Apps → Expo Go → Permissions, and enable **Photos/Media**.
  * In Expo Go, you may be prompted when tapping the photo box; tap "Allow" if you see a permission dialog.
