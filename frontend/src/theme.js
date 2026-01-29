import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#3b82f6', // Premium Blue
            light: '#60a5fa',
            dark: '#1d4ed8',
            contrastText: '#fff'
        },
        secondary: {
            main: '#0f172a', // Deep Midnight
            light: '#1e293b',
            dark: '#020617',
            contrastText: '#fff'
        },
        background: {
            default: '#f8fafc',
            paper: '#ffffff'
        },
        text: {
            primary: '#0f172a',
            secondary: '#64748b'
        },
        success: { main: '#10b981' },
        warning: { main: '#f59e0b' },
        error: { main: '#ef4444' },
        info: { main: '#06b6d4' }
    },
    typography: {
        fontFamily: '"Inter", "Poppins", sans-serif',
        h1: { fontWeight: 900, letterSpacing: '-0.025em' },
        h2: { fontWeight: 800, letterSpacing: '-0.025em' },
        h3: { fontWeight: 800, letterSpacing: '-0.025em' },
        h4: { fontWeight: 700, letterSpacing: '-0.025em' },
        h5: { fontWeight: 700, letterSpacing: '-0.025em' },
        h6: { fontWeight: 600, letterSpacing: '-0.025em' },
        button: { fontWeight: 700, textTransform: 'none', letterSpacing: '0.025em' },
        body1: { fontSize: '0.95rem', lineHeight: 1.6 },
        caption: { fontWeight: 600, letterSpacing: '0.05em' }
    },
    shape: {
        borderRadius: 12
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    boxShadow: 'none',
                    '&:hover': { boxShadow: '0 8px 16px rgba(67, 24, 255, 0.15)' }
                },
                contained: {
                    background: 'linear-gradient(90deg, #868CFF 0%, #4318FF 100%)',
                    color: 'white',
                    '&:hover': {
                        background: 'linear-gradient(90deg, #757bf0 0%, #3a16d8 100%)',
                    }
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.12)'
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '20px',
                    boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.12)',
                    border: 'none'
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 600,
                    color: '#a3aed0',
                    borderBottom: '1px solid #e9edf7'
                },
                body: {
                    color: '#2b3674',
                    fontWeight: 500,
                    borderBottom: '1px solid #e9edf7'
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '16px'
                    }
                }
            }
        }
    }
});

export default theme;
