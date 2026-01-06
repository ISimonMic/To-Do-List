# To-Do List Web App

A mobile-optimized, touch-friendly to-do list application built with vanilla HTML, CSS, and JavaScript.

## Features

- **Add Tasks**: Create tasks with multi-line text support
- **Complete Tasks**: Tap checkbox to mark tasks complete with strike-through effect
- **Edit Tasks**: Long-press (750ms) any task to edit or delete it
- **Delete Tasks**: Remove tasks with confirmation via long-press menu
- **Dark Mode**: Toggle between light and dark themes with slider in top-left
- **Data Persistence**: All tasks and theme preference saved to LocalStorage
- **Mobile-Optimized**: Touch-friendly interface with 44px minimum touch targets
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Accessible**: Full keyboard navigation and screen reader support

## Usage

1. Open [index.html](index.html) in a web browser
2. Add tasks using the textarea input field
   - Press Enter to submit (Shift+Enter for new line in task)
3. Tap the checkbox beside any task to mark it complete/incomplete
4. Long-press (hold for 750ms) on any task to show edit/delete menu
5. Toggle dark mode using the slider switch in the top-left corner

## Technical Details

### Stack
- **HTML5** - Semantic markup with ARIA accessibility
- **CSS3** - Custom properties for theming, Flexbox and Grid for layout
- **JavaScript (ES6)** - Vanilla JS with no frameworks or dependencies

### Browser Support
- iOS Safari 14+
- Chrome for Android
- Chrome, Firefox, Safari, Edge (latest versions)

### Key Features
- **No Dependencies**: Pure vanilla JavaScript, no build process required
- **Offline Ready**: Works completely offline once loaded
- **LocalStorage**: Client-side data persistence (no server needed)
- **Touch Optimized**: Native touch event handling with haptic feedback
- **CSS Variables**: Efficient theme switching without JavaScript manipulation
- **Mobile-First**: Responsive design starting from 320px width

## File Structure

```
todo-app/
├── index.html          # Main HTML structure
├── styles.css          # All styling and themes
├── script.js           # Application logic
└── README.md           # This file
```

## Browser Storage

The app uses LocalStorage to persist:
- Task list (up to ~5MB depending on browser)
- Dark mode preference

**Note**: Clearing browser data will delete all tasks.

## Keyboard Shortcuts

- **Tab**: Navigate between elements
- **Enter**: Add new task (in textarea without Shift)
- **Shift+Enter**: New line in textarea
- **Space/Enter**: Toggle checkbox
- **Escape**: Cancel context menu or inline edit

## License

MIT License - Feel free to use and modify as needed.

## Credits

Built with Claude Code as a mobile-first, accessible web application.
