# Ticketing System Frontend

React-based frontend for the Ticketing System.

## Overview

This package contains the user interface for the Ticketing System, built with React and Bootstrap. It provides a responsive interface for managing tickets, devices, and user authentication.

## Features

- User authentication
- Ticket management (create, view, update, delete)
- Device management
- Responsive design

## Development

To start the development server:

```bash
npm run dev
```

### Running Tests

To run all tests:

```bash
npm test
```

## Building

To build the application for production:

```bash
npm run build
```

## Linting and Formatting

### ESLint

To run the linter:

```bash
npm run lint
```

To fix linting issues automatically:

```bash
npm run lint:fix
```

### Prettier

To check code formatting:

```bash
npm run format
```

To automatically format code:

```bash
npm run format:fix
```

## Project Structure

```
src/
├── components/     # Reusable React components
├── config/         # Configuration files
├── helpers/        # Helper functions
├── mocks/          # Test mocks
├── pages/          # Page components
├── services/       # API service functions
├── App.jsx         # Main application component
└── main.jsx        # Application entry point