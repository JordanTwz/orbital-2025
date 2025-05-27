## 1. Prerequisites

- A Windows PC on the same Wi-Fi network as your phone  
- An Android or iOS phone with **Expo Go** installed  
- An OpenAI API key (starts with `sk-…`)
  
> **If you do not have an OpenAI API key, please email jordan_tan@u.nus.edu for a temporary one.**


## 2. Install Node.js

1. Go to https://nodejs.org  
2. Download the **LTS** installer for Windows and run it.  
3. Accept all defaults so you get both **Node.js** and **npm**.  


## 3. Download and Unzip

1. On GitHub, click **Code → Download ZIP**.  
2. When download finishes, open **File Explorer** → **Downloads**.  
3. Right-click the ZIP, choose **Extract All…**, and extract to get a folder named `MealCraft`.


## 4. Set Your OpenAI Key

1. In **Downloads\MealCraft**, find `.env.example`.  
2. Rename it to `.env`.  
3. Right-click `.env`, choose **Open with → Notepad**.  
4. Replace the placeholder line with your actual key:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```
5. Save (Ctrl+S) and close Notepad.


## 5. Open a Command Prompt and Install Packages

1. Press **Windows key**, type `cmd`, and press **Enter**.  
2. In the terminal, type:
   ```
   cd Downloads\MealCraft
   ```
   and press **Enter**.  
3. Install all dependencies:
   ```
   npm install
   ```


## 6. Find Your IPv4 Address

> **Do this just before editing the code.**

1. In the **same** Command Prompt, type:
   ```
   ipconfig
   ```
   and press **Enter**.  
2. Under your active Wi-Fi adapter, note the **IPv4 Address**, e.g. `192.168.1.23`.


## 7. Update the App with Your IP

1. Still in **Downloads\MealCraft**, open `screens\MealLogScreen.tsx` in Notepad:  
   ```
   notepad screens\MealLogScreen.tsx
   ```
2. Locate this line near the top:
   ```ts
   const SERVER = 'http://192.168.XX.XX:3000'
   ```
3. Replace `XX.XX` with your IPv4 address from step 6. For example:
   ```ts
   const SERVER = 'http://192.168.1.23:3000'
   ```
4. Save and close Notepad.


## 8. Start the Server

1. In your Command Prompt (still in `Downloads\MealCraft`), run:
   ```
   node server\index.js
   ```
2. You should see:
   ```
   OPENAI_API_KEY loaded: true
   Server listening on port 3000
   ```
   Leave this window open.


## 9. Launch the Mobile App

1. Open a **new** Command Prompt:  
   - Press **Windows key**, type `cmd`, Enter.  
2. Navigate back:
   ```
   cd Downloads\MealCraft
   ```
3. Start Expo:
   ```
   npx expo start
   ```
4. A browser tab opens with a **QR code**.  
5. In **Expo Go** on your phone, tap **Scan QR Code** and scan it.  
6. The MealCraft app will load on your device.


## 10. Use MealCraft

1. Tap **Sign Up**, enter an email & password.  
2. Tap **Sign In** to reach Home.  
3. Choose **Log a Meal**, then **Tap to add a photo**.  
4. Select an image, then tap **Analyze Meal**.  
5. View your meal’s calories and macros!


### Troubleshooting

- **Server errors** → check your IP in `MealLogScreen.tsx`, then restart (`Ctrl+C` → `node server\index.js`).  
- **Expo won’t connect** → ensure phone & PC share the same Wi-Fi.  
- **API key not loaded** → confirm `.env` lives directly in `Downloads\MealCraft` and is correctly formatted.  
