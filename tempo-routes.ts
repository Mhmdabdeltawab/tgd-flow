// This file is used by Tempo to route to storyboards
// It's only included in development when VITE_TEMPO is true

const routes = [
  {
    path: "/tempobook/*",
    element: null, // Tempo will handle this route
  },
];

export default routes;
