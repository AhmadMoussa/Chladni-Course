import React from 'react';
import { ConfigVariable } from './types';  // You'll need to move types to a separate file
import { Box, Slider, Switch, FormControl, FormControlLabel, Typography } from '@mui/material';

interface ConfigControlsProps {
  configVars: ConfigVariable[];
  onConfigChange: (name: string, value: number | boolean) => void;
}

const ConfigControls: React.FC<ConfigControlsProps> = ({ configVars, onConfigChange }) => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', marginLeft: 'auto' }}>
      {configVars.map((config) => (
        console.log(config),
        <FormControl
          key={config.name}
          sx={{
            borderColor: '#000000',
            paddingTop: 1,
            paddingBottom: 1,
            paddingLeft: 2,
            paddingRight: 2,
            alignSelf: 'flex-end',
            margin: 0,
            padding: 0
          }}
        >
          {config.type === 'number' && (
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '8px 16px'
              }}
            >
              <Typography variant="caption" color="#FFFFFF" sx={{ mb: 0, fontSize: '0.65rem', lineHeight: 1.75 }}>
                {config.label}
              </Typography>
              <Slider
                size="medium"
                sx={{
                  width: '120px',
                  '& .MuiSlider-thumb': {
                    width: 10,
                    height: 10,
                  },
                  '& .MuiSlider-track': {
                    color: '#000000',
                    height: 2,
                    borderRadius: 0,
                  },
                  '& .MuiSlider-valueLabel': {
                    fontSize: '0.6rem',
                    lineHeight: 1.5,
                  },
                  mb: 0,
                  pb: 0,
                }}
                min={config.min ?? 0}
                max={config.max ?? 100}
                step={config.step ?? 1}
                marks={true}
                value={config.value as number}
                onChange={(_, value) => onConfigChange(config.name, value as number)}
                valueLabelDisplay="auto"
              />
              
              <Box sx={{ width: '100px', display: 'flex', justifyContent: 'space-between', mt: '-4px' }}>
                <Typography 
                  variant="caption" 
                  color="#FFFFFF" 
                  sx={{ fontSize: '0.6rem', lineHeight: 1.5 }}
                >
                  {config.min}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="#FFFFFF" 
                  sx={{ fontSize: '0.6rem', lineHeight: 1.5 }}
                >
                  {config.max}
                </Typography>
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
                  {config.label ?? config.name}
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