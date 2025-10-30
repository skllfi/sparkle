<div align="center">
  <a href="https://github.com/Parcoil/Sparkle">
    <img src="./resources/sparklelogo.png" alt="Sparkle Logo" width="80" height="80">
  </a>

  <h3>Sparkle</h3>
  <p>A Windows app to debloat and optimize your PC</p>
</div>

---

### ✨ Sparkle (Extended Version)

This is a significantly enhanced version of the original [Sparkle](https://github.com/Parcoil/Sparkle) application, tailored for a wider audience with a focus on network management and system utilities.

#### Key Differences & New Features:

*   **Full Russian Localization:** The entire application interface, including all new features, has been fully translated into Russian.
*   **New "Utilities" Tab:** A dedicated section has been added, consolidating powerful tools for managing network settings and the system.
*   **NoDPI Integration (DPI Circumvention):**
    *   Built-in `NoDPI` utility to effectively bypass Deep Packet Inspection (DPI) by internet providers.
    *   Allows enabling/disabling the bypass, adding it to Windows startup, and monitoring real-time statistics.
    *   Features a user-friendly editor for managing the list of domains to be processed by the utility (`blacklist.txt`).
*   **DNS Server Manager:**
    *   Change system-wide DNS servers in one click, choosing from popular and trusted options (Google, Quad9, AdGuard DNS, etc.).
    *   Helps improve privacy, security, and website access speed.
*   **Additional System Utilities:**
    *   **Flush DNS Cache:** Instantly clears the system's DNS cache.
    *   **Disk Cleanup:** Launches the standard Windows utility to free up disk space.

---

<div align="center">
  <p>
    <img alt="React" src="https://img.shields.io/badge/React-000000?style=for-the-badge&logo=react&labelColor=0c121f&color=0c121f">
    <img alt="Electron" src="https://img.shields.io/badge/Electron-000000?style=for-the-badge&logo=electron&labelColor=0c121f&color=0c121f">
    <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-000000?style=for-the-badge&logo=javascript&labelColor=0c121f&color=0c121f">
    <img alt="PowerShell" src="https://img.shields.io/badge/PowerShell-000000?style=for-the-badge&logo=gnometerminal&labelColor=0c121f&color=0c121f">
  </p>

Install with Powershell:

```powershell
irm https://getsparkle.net/get | iex
```

<a href="https://github.com/Parcoil/Sparkle/releases/latest">Download Installer/Portable</a>

  <br/>
  <br/>

  <img src="./images/appshowcase.png" alt="Sparkle App Screenshot" width="90%">

</div>
  
> [!WARNING]
> Sparkle is currently in beta. While we've tested it extensively, you may encounter some bugs. Please back up your system before applying tweaks and report any issues you find.

<div align="center">
  <h3>🚀 Features</h3>

  <ul align="left">
    <li>📈 Apply Tweaks to Optimize your system</li>
    <li>🗑️ Manage All Temp files in one place</li>
    <li>🎛️ Install apps with the built-in Winget integration</li>
    <li>📁 Backup and Revert changes</li>
    <li>⚙️ View Basic System info</li>
  </ul>
</div>

<div>
  <h2>📃 Docs</h2>
  <p>You can find the docs <a href="https://docs.getsparkle.net">here</a></p>
  the docs cover all the tweaks how they work what they do and all of sparkles pages
</div>

<div>
  <h3>💖 Credits</h3>
  <ul>
    <li>
      <a href="https://github.com/ChrisTitusTech/winutil">CTT's WinUtil (Some of the tweaks & part of the inspo for making this v2 of this project)</a>
    </li>
    <li>
      <a href="https://github.com/Raphire/Win11Debloat">Raphire Win11Debloat ( Debloat script offered in Sparkle debloat script)</a>
    </li>
  </ul>

  <h3>👥 Contributing</h3>

  <h4>Adding New Tweaks</h4>
  <ul>
    <li>Tweaks are located in <code>resources/tweaks/</code></li>
    <li>More info in <code>resources/tweaks/readme.md</code></li>
  </ul>

Refer to the <a href="https://docs.getsparkle.net">docs</a> for more info on how to add new tweaks

  <h4>Other Ways to Contribute</h4>
  <ul>
    <li>🐛 Report bugs and issues</li>
    <li>💡 Suggest new features or improvements</li>
    <li>📝 Improve documentation</li>
    <li>🎨 Enhance the UI/UX</li>
    <li>🧪 Improve code quality</li>
  </ul>

<h4>🛠️ Building Sparkle</h4>

<p>To build sparkle you will need the following</p>
<ul>
  <li><b>Node.js</b> v22 or higher</li>
  <li><b>PNPM</b></li>
  <li><b>Windows 10/11</b></li>
</ul>

</div>

> [!IMPORTANT]
> The version of sparkle in the repo is most likely newer than the latest release. expect bugs and unreleased features

<ol>
  <li>
    <b>Clone the repository:</b>
    <pre><code>git clone https://github.com/Parcoil/Sparkle
cd Sparkle</code></pre>
  </li>
  <li>
    <b>Install dependencies:</b>
    <pre><code>pnpm install</code></pre>
  </li>
  <li>
    <b>Start the app in development mode:</b>
    <pre><code>pnpm dev</code></pre>
    <i>This will launch Sparkle with hot reload for both the Electron main and renderer processes.</i>
  </li>
  <br/>
  <li>
    <b>Build for production:</b>
    <pre><code>pnpm build</code></pre>
    <i>This will generate optimized production builds.</i>
  </li>
</ol>
 <br/>
  <p align="center">Made with ❤️ by Parcoil</p>

## Star History

<a href="https://www.star-history.com/#Parcoil/Sparkle&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Parcoil/Sparkle&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Parcoil/Sparkle&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Parcoil/Sparkle&type=Date" />
 </picture>
</a>

---

<div align="center">
  <a href="https://github.com/Parcoil/Sparkle">
    <img src="./resources/sparklelogo.png" alt="Логотип Sparkle" width="80" height="80">
  </a>

  <h3>Sparkle</h3>
  <p>Приложение для Windows для очистки и оптимизации вашего ПК</p>
</div>

---

### ✨ Sparkle (Расширенная версия)

Это значительно доработанная версия оригинального приложения [Sparkle](https://github.com/Parcoil/Sparkle), созданная для русскоязычного сообщества. Она включает в себя полную локализацию, новые функции для обхода ограничений и дополнительные системные утилиты.

#### Ключевые отличия и нововведения:

*   **Полная русская локализация:** Весь интерфейс приложения, включая все новые функции, полностью переведен на русский язык.
*   **Новая вкладка "Утилиты":** Добавлен специальный раздел, объединяющий мощные инструменты для управления сетевыми настройками и системой.
*   **Интеграция NoDPI (Обход блокировок DPI):**
    *   Встроена утилита `NoDPI` для эффективного обхода глубокой фильтрации трафика (*Deep Packet Inspection*) со стороны провайдеров.
    *   Позволяет включать/выключать обход, добавлять его в автозагрузку Windows и отслеживать статистику работы в реальном времени.
    *   Реализован удобный редактор для управления списком доменов, которые должны обрабатываться утилитой (`blacklist.txt`).
*   **Менеджер DNS-серверов:**
    *   Позволяет в один клик менять системные DNS-серверы, выбирая из популярных и проверенных вариантов (Google, Quad9, AdGuard DNS и др.).
    *   Помогает повысить конфиденциальность, безопасность и скорость доступа к сайтам.
*   **Дополнительные системные утилиты:**
    *   **Очистка DNS-кеша:** Мгновенно сбрасывает системный кэш DNS.
    *   **Очистка диска:** Запускает стандартную утилиту Windows для освобождения места на диске.

---

<div align="center">
  <p>
    <img alt="React" src="https://img.shields.io/badge/React-000000?style=for-the-badge&logo=react&labelColor=0c121f&color=0c121f">
    <img alt="Electron" src="https://img.shields.io/badge/Electron-000000?style=for-the-badge&logo=electron&labelColor=0c121f&color=0c121f">
    <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-000000?style=for-the-badge&logo=javascript&labelColor=0c121f&color=0c121f">
    <img alt="PowerShell" src="https://img.shields.io/badge/PowerShell-000000?style=for-the-badge&logo=gnometerminal&labelColor=0c121f&color=0c121f">
  </p>

Установка через Powershell:

```powershell
irm https://getsparkle.net/get | iex
```

<a href="https://github.com/Parcoil/Sparkle/releases/latest">Скачать установщик/портативную версию</a>

  <br/>
  <br/>

  <img src="./images/appshowcase.png" alt="Скриншот приложения Sparkle" width="90%">

</div>
  
> [!WARNING]
> Sparkle находится в стадии бета-тестирования. Хотя мы тщательно протестировали его, вы можете столкнуться с некоторыми ошибками. Пожалуйста, сделайте резервную копию вашей системы перед применением твиков и сообщайте о любых найденных проблемах.

<div align="center">
  <h3>🚀 Возможности</h3>

  <ul align="left">
    <li>📈 Применяйте твики для оптимизации вашей системы</li>
    <li>🗑️ Управляйте всеми временными файлами в одном месте</li>
    <li>🎛️ Устанавливайте приложения со встроенной интеграцией Winget</li>
    <li>📁 Создавайте резервные копии и отменяйте изменения</li>
    <li>⚙️ Просматривайте основную информацию о системе</li>
  </ul>
</div>

<div>
  <h2>📃 Документация</h2>
  <p>Вы можете найти документацию <a href="https://docs.getsparkle.net">здесь</a>.</p>
  Документация описывает все твики, как они работают, что они делают, а также все страницы Sparkle.
</div>

<div>
  <h3>💖 Благодарности</h3>
  <ul>
    <li>
      <a href="https://github.com/ChrisTitusTech/winutil">CTT's WinUtil (Некоторые твики и часть вдохновения для создания v2 этого проекта)</a>
    </li>
    <li>
      <a href="https://github.com/Raphire/Win11Debloat">Raphire Win11Debloat (Скрипт для очистки, предлагаемый в Sparkle)</a>
    </li>
  </ul>

  <h3>👥 Участие в проекте</h3>

  <h4>Добавление новых твиков</h4>
  <ul>
    <li>Твики находятся в <code>resources/tweaks/</code></li>
    <li>Больше информации в <code>resources/tweaks/readme.md</code></li>
  </ul>

Обратитесь к <a href="https://docs.getsparkle.net">документации</a> для получения дополнительной информации о том, как добавлять новые твики.

  <h4>Другие способы внести вклад</h4>
  <ul>
    <li>🐛 Сообщайте об ошибках и проблемах</li>
    <li>💡 Предлагайте новые функции или улучшения</li>
    <li>📝 Улучшайте документацию</li>
    <li>🎨 Улучшайте UI/UX</li>
    <li>🧪 Повышайте качество кода</li>
  </ul>

<h4>🛠️ Сборка Sparkle</h4>

<p>Для сборки Sparkle вам понадобится следующее:</p>
<ul>
  <li><b>Node.js</b> v22 или выше</li>
  <li><b>PNPM</b></li>
  <li><b>Windows 10/11</b></li>
</ul>

</div>

> [!IMPORTANT]
> Версия Sparkle в репозитории, скорее всего, новее последнего релиза. Ожидайте ошибок и неизданных функций.

<ol>
  <li>
    <b>Клонируйте репозиторий:</b>
    <pre><code>git clone https://github.com/Parcoil/Sparkle
cd Sparkle</code></pre>
  </li>
  <li>
    <b>Установите зависимости:</b>
    <pre><code>pnpm install</code></pre>
  </li>
  <li>
    <b>Запустите приложение в режиме разработки:</b>
    <pre><code>pnpm dev</code></pre>
    <i>Это запустит Sparkle с горячей перезагрузкой для основного и рендерер-процессов Electron.</i>
  </li>
  <br/>
  <li>
    <b>Сборка для продакшена:</b>
    <pre><code>pnpm build</code></pre>
    <i>Эта команда сгенерирует оптимизированные сборки для продакшена.</i>
  </li>
</ol>
 <br/>
  <p align="center">Сделано с ❤️ Parcoil</p>

## История звёзд

<a href="https://www.star-history.com/#Parcoil/Sparkle&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Parcoil/Sparkle&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Parcoil/Sparkle&type=Date" />
   <img alt="График истории звёзд" src="https://api.star-history.com/svg?repos=Parcoil/Sparkle&type=Date" />
 </picture>
</a>
