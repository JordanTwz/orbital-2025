## MealCraft: Starting Guide

Welcome to **MealCraft**! This guide will help you run both the back-end server and the mobile app on your Windows PC and phone. We'll assume everything ends up in your **Downloads** folder.

> **Tip:** If at any point you see a command prompt error, don't panic - just follow the troubleshooting tips at the end.



### Prerequisites

1. **Node.js & npm**

   * Go to [https://nodejs.org/](https://nodejs.org/)
   * Download and install the **LTS** version for Windows.
   * After installation, open **PowerShell** and run:

     ```powershell
     node -v
     npm -v
     ```

     You should see version numbers.

2. **Git**

   * Install from [https://git-scm.com/download/win](https://git-scm.com/download/win)

3. **Expo Go (on your phone)**

   * On your Android or iPhone, install **Expo Go** from the App Store or Google Play.



## 1. Clone the Repository

1. Open **PowerShell**.
2. Navigate to your **Downloads** folder:

   ```powershell
   cd $env:USERPROFILE\Downloads
   ```
3. Clone the code:

   ```powershell
   git clone https://github.com/JordanTwz/orbital-2025.git
   ```
4. Enter the project folder:

   ```powershell
   cd orbital-2025
   ```



## 2. Install All Dependencies (Root First)

1. Still in the project root (`…\Downloads\orbital-2025`), install everything:

   ```powershell
   npm install
   ```
   > You may ignore any `npm warn deprecated` warnings that appear.



## 3. Back-End Server Setup

1. In the **same** PowerShell tab, go into the `server` folder:

   ```powershell
   cd .\server
   ```

2. Install server-only dependencies:

   ```powershell
   npm install
   ```

3. Create a file named `.env` in `orbital-2025\server`:

   * In **File Explorer**, right-click → New → Text Document
   * Rename it to `.env` (no `.txt`).
   * Open it in Notepad and paste:

     ```
     OPENAI_API_KEY=YOUR_OPENAI_KEY_HERE
     ```
   * Replace `YOUR_OPENAI_KEY_HERE` with your key from [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys).
      > If you do not have one, please email jordan_tan@u.nus.edu for a temporary key.
   * Save and close.

4. Find your PCs local IPv4 address:

   ```powershell
   ipconfig
   ```

   * Look for **IPv4 Address** (e.g., `192.168.1.42`).

5. Edit the mobile app to use this IP:

   * In **File Explorer**, open:

     ```
     Downloads\orbital-2025\screens\MealLogScreen.tsx
     ```
   * Locate (on line 38):

     ```ts
     const SERVER = 'http://192.168.XX.XX:3000'
     ```
   * Replace `192.168.XX.XX` with your actual IPv4 (e.g., `192.168.1.42`).
   * Do not change port 3000.
   * Save.

6. Start the server:

   ```powershell
   node index.js
   ```

   * You should see:

     ```
     OPENAI_API_KEY loaded: true
     Server listening on port 3000
     ```
   * **Keep this window open** while you work.



## 4. Front-End (Expo) Setup

1. Open a **new PowerShell window** (so the server stays running).
2. Go back to the project root:

   ```powershell
   cd $env:USERPROFILE\Downloads\orbital-2025
   ```
3. Start Expo:

   ```powershell
   npx expo start
   ```

   * A browser window (“Metro Bundler”) will open with a QR code.
   * Keep this running.



## 5. Run on Your Phone

1. Ensure your phone and PC are on the **same Wi-Fi network**.
2. Open **Expo Go** on your phone.
3. Tap **Scan QR Code** and point at the code in the Metro Bundler.
4. MealCraft will load - look for the **Sign In** screen.



## 6. Quick Verification

1. **Sign Up** or **Sign In**
2. On Home screen, tap **Log a Meal**
3. Allow photo access, select an image, then tap **Analyze Meal**
4. You should see calories and dish details within seconds.



## 7. Common Troubleshooting

* **“Running scripts is disabled”**
  In PowerShell (as Administrator):

  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ```
* **“Network request failed” when analysing**

  * Did you run `node index.js` in `orbital-2025\server`?
  * Is the server window still running?
  * Is your IP correct in `MealLogScreen.tsx`?
  * Are PC and phone on the same Wi-Fi (same `192.168.x.x`)?
* **Server shows `OPENAI_API_KEY loaded: false`**

  * Did you save and restart `node index.js` after editing `.env`?
  * Is `.env` in the `/server` folder with no extra spaces?
* **Expo errors or won't load**

  * Did you run `npm install` in the root?
  * Are you running `npx expo start` from the project root?
