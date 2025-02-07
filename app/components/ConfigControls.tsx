import React from 'react';
import { ConfigVariable } from './types';  // You'll need to move types to a separate file
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';

interface ConfigControlsProps {
  configVars: ConfigVariable[];
  onConfigChange: (name: string, value: number | boolean) => void;
  orientation?: 'horizontal' | 'vertical';
  isCollapsed?: boolean;
  onCollapse?: () => void;
  autoRun?: boolean;
  onAutoRunChange?: (checked: boolean) => void;
  onRunSketch?: () => void;
}

const ConfigControls: React.FC<ConfigControlsProps> = ({ 
  configVars, 
  onConfigChange, 
  orientation = 'horizontal',
  isCollapsed = false,
  onCollapse,
  autoRun,
  onAutoRunChange,
  onRunSketch
}) => {
  const isVertical = orientation === 'vertical';

  if (isVertical && isCollapsed) {
    return (
      <Box
        sx={{
          width: '32px',
          height: '100%',
          borderLeft: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backgroundColor: 'var(--bg-color)',
        }}
        onClick={onCollapse}
      >
        <Typography
          sx={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            color: 'var(--font-color)',
            fontSize: '0.875rem'
          }}
        >
          Controls
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        width: isVertical ? (isCollapsed ? '32px' : '200px') : 'auto',
        height: isVertical ? '100%' : 'auto',
        backgroundColor: 'var(--bg-color)',
        transition: 'width 0.3s',
        position: 'relative',
      }}
    >
      {isVertical && (
        <button
          onClick={onCollapse}
          style={{
            width: '16px',
            height: '100%',
            background: 'var(--bg-color)',
            border: 'none',
            borderRight: '1px solid var(--border-color)',
            cursor: 'pointer',
            color: 'var(--font-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0
          }}
        >
          {isCollapsed ? '←' : '→'}
        </button>
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          height: '100%',
        }}
      >
        {isVertical ? (
          <>
            <Box sx={{ p: 2, borderBottom: '1px solid var(--border-color)' }}>
              <Box sx={{ mb: 2 }}>
                <button
                  onClick={onRunSketch}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: 'white',
                    border: '1px solid var(--border-color)',
                    color: 'var(--font-color)',
                    cursor: 'pointer',
                  }}
                >
                  Run Sketch
                </button>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRun}
                    onChange={(e) => onAutoRunChange?.(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" color="var(--font-color)">
                    Auto-run
                  </Typography>
                }
              />
            </Box>
            <Box sx={{ flex: 1 }} /> {/* Spacer */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              {configVars.map((config) => (
                <FormControl
                  key={config.name}
                  sx={{
                    borderTop: '1px solid var(--border-color)',
                    '&:first-of-type': {
                      borderTop: 'none',
                    },
                    p: 1,
                    backgroundColor: 'var(--bg-color)',
                  }}
                >
                  {config.type === 'number' && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="var(--font-color)"
                        sx={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}
                      >
                        {config.label}
                      </Typography>
                      <Slider
                        size="small"
                        sx={{
                          width: '100px',
                          '& .MuiSlider-thumb': {
                            width: 10,
                            height: 10
                          },
                          '& .MuiSlider-track': {
                            color: 'var(--font-color)',
                            height: 2,
                            borderRadius: 0
                          },
                          '& .MuiSlider-valueLabel': {
                            fontSize: '0.6rem',
                            lineHeight: 1.5
                          }
                        }}
                        min={config.min ?? 0}
                        max={config.max ?? 100}
                        step={config.step ?? 1}
                        value={config.value as number}
                        onChange={(_, value) => onConfigChange(config.name, value as number)}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  )}
                  {config.type === 'boolean' && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.value as boolean}
                          onChange={(e) => onConfigChange(config.name, e.target.checked)}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2" color="var(--font-color)" sx={{ whiteSpace: 'nowrap' }}>
                          {config.label ?? config.name}
                        </Typography>
                      }
                      sx={{ m: 0 }}
                    />
                  )}
                </FormControl>
              ))}
            </Box>
          </>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'row',
            alignItems: 'center',
            height: '100%',
            gap: 2
          }}>
            {configVars.map((config) => (
              <FormControl
                key={config.name}
                sx={{
                  borderLeft: '1px solid var(--border-color)',
                  p: 1,
                  backgroundColor: 'var(--bg-color)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  minWidth: 'auto'
                }}
              >
                {config.type === 'number' && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="var(--font-color)"
                      sx={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}
                    >
                      {config.label}
                    </Typography>
                    <Slider
                      size="small"
                      sx={{
                        width: '100px',
                        '& .MuiSlider-thumb': {
                          width: 10,
                          height: 10
                        },
                        '& .MuiSlider-track': {
                          color: 'var(--font-color)',
                          height: 2,
                          borderRadius: 0
                        },
                        '& .MuiSlider-valueLabel': {
                          fontSize: '0.6rem',
                          lineHeight: 1.5
                        }
                      }}
                      min={config.min ?? 0}
                      max={config.max ?? 100}
                      step={config.step ?? 1}
                      value={config.value as number}
                      onChange={(_, value) => onConfigChange(config.name, value as number)}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                )}
                {config.type === 'boolean' && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.value as boolean}
                        onChange={(e) => onConfigChange(config.name, e.target.checked)}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2" color="var(--font-color)" sx={{ whiteSpace: 'nowrap' }}>
                        {config.label ?? config.name}
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />
                )}
              </FormControl>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ConfigControls; 