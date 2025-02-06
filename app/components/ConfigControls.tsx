import React from 'react';
import { ConfigVariable } from './types';  // You'll need to move types to a separate file
import { Box, Slider, Switch, FormControl, FormControlLabel, Typography } from '@mui/material';

interface ConfigControlsProps {
  configVars: ConfigVariable[];
  onConfigChange: (name: string, value: number | boolean) => void;
}

const ConfigControls: React.FC<ConfigControlsProps> = ({ configVars, onConfigChange }) => {
  return (
    <Box sx={{ display: 'flex', flexWrap: '', gap: 5 }}>
      {configVars.map((config) => (
        <FormControl key={config.name} sx={{ minWidth: 200, backgroundColor: '#444', paddingTop: 1, paddingBottom: 1, paddingLeft: 2, paddingRight: 2, borderRadius: 2 }}>
          {config.type === 'number' && (
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 0.5 }}>
                
                
                <Typography variant="body2" color="#FFFFFF">
                    {config.name}
                  </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flex: 1, gap: 1.5 }}>
                <Typography variant="body2" sx={{ minWidth: 8 }}>
                  {config.min}
                </Typography>
                  <Slider
                    size="medium"
                    sx={{
                      width: '100px',
                      '& .MuiSlider-thumb': {
                        width: 10,
                        height: 10,
                      },
                    }}
                    min={config.min ?? 0}
                    max={config.max ?? 100}
                    step={config.step ?? 1}
                    marks={true}
                    value={config.value as number}
                    onChange={(_, value) => onConfigChange(config.name, value as number)}
                    valueLabelDisplay="auto"
                  />
                  <Typography variant="body2" sx={{ minWidth: 10 }}>
                  {config.max}
                </Typography>
                </Box>
                
              </Box>
            </Box>
          )}
          {config.type === 'boolean' && (
            <FormControlLabel
              control={
                <Switch
                  checked={config.value as boolean}
                  onChange={(e) => onConfigChange(config.name, e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" color="#FFFFFF">
                  {config.name}
                </Typography>
              }
            />
          )}
        </FormControl>
      ))}
    </Box>
  );
};

export default ConfigControls; 