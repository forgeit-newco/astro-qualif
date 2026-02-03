import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  FormHelperText,
  TextField,
} from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';
import {
  TEAM_SIZES,
  FORGES,
  CLOUDS,
  DEPLOYMENTS,
  TICKET_MANAGERS,
  MONITORING_TOOLS,
  type ProspectFormData,
  type Forge,
  type Cloud,
  type Deployment,
  type TicketManager,
  type MonitoringTool,
} from '../../types/prospect';

const OTHER_PREFIX = 'Autre: ';

export function TechEcosystemBlock() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ProspectFormData>();

  const [forgeOtherEnabled, setForgeOtherEnabled] = useState(false);
  const [forgeOtherValue, setForgeOtherValue] = useState('');
  const [cloudOtherEnabled, setCloudOtherEnabled] = useState(false);
  const [cloudOtherValue, setCloudOtherValue] = useState('');
  const [deploymentOtherEnabled, setDeploymentOtherEnabled] = useState(false);
  const [deploymentOtherValue, setDeploymentOtherValue] = useState('');
  const [ticketManagerOtherEnabled, setTicketManagerOtherEnabled] = useState(false);
  const [ticketManagerOtherValue, setTicketManagerOtherValue] = useState('');
  const [monitoringOtherEnabled, setMonitoringOtherEnabled] = useState(false);
  const [monitoringOtherValue, setMonitoringOtherValue] = useState('');

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
        2. Écosystème Tech
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Mesurons la complexité technique
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Taille équipe */}
        <Controller
          name="techEcosystem.teamSize"
          control={control}
          rules={{ required: 'Le nombre de collaborateurs est requise' }}
          render={({ field }) => (
            <FormControl error={!!errors.techEcosystem?.teamSize}>
              <FormLabel>Nombre de collaborateurs ratachés à la DSI</FormLabel>
              <RadioGroup {...field} row>
                {TEAM_SIZES.map((size) => (
                  <FormControlLabel key={size} value={size} control={<Radio />} label={size} />
                ))}
              </RadioGroup>
              {errors.techEcosystem?.teamSize && (
                <FormHelperText>{errors.techEcosystem.teamSize.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        {/* Git */}
        <Controller
          name="techEcosystem.forges"
          control={control}
          defaultValue={[]}
          rules={{ validate: (v) => v.length > 0 || 'Sélectionnez au moins une forge' }}
          render={({ field }) => (
            <FormControl error={!!errors.techEcosystem?.forges}>
              <FormLabel>Hebergement du code</FormLabel>
              <FormGroup row>
                {FORGES.map((forge) => (
                  <FormControlLabel
                    key={forge}
                    control={
                      <Checkbox
                        checked={field.value.includes(forge)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            field.onChange([...field.value, forge]);
                          } else {
                            field.onChange(field.value.filter((v: Forge) => v !== forge));
                          }
                        }}
                      />
                    }
                    label={forge}
                  />
                ))}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={forgeOtherEnabled}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setForgeOtherEnabled(e.target.checked);
                        if (!e.target.checked && forgeOtherValue) {
                          field.onChange(field.value.filter((v: string) => !v.startsWith(OTHER_PREFIX)));
                          setForgeOtherValue('');
                        }
                      }}
                    />
                  }
                  label="Autre"
                />
              </FormGroup>
              {forgeOtherEnabled && (
                <TextField
                  size="small"
                  placeholder="Précisez..."
                  value={forgeOtherValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newValue = e.target.value;
                    setForgeOtherValue(newValue);
                    const filtered = field.value.filter((v: string) => !v.startsWith(OTHER_PREFIX));
                    if (newValue.trim()) {
                      field.onChange([...filtered, `${OTHER_PREFIX}${newValue}`]);
                    } else {
                      field.onChange(filtered);
                    }
                  }}
                  sx={{ mt: 1, maxWidth: 250 }}
                />
              )}
              {errors.techEcosystem?.forges && (
                <FormHelperText>{errors.techEcosystem.forges.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        {/* Clouds */}
        <Controller
          name="techEcosystem.clouds"
          control={control}
          defaultValue={[]}
          rules={{ validate: (v) => v.length > 0 || 'Sélectionnez au moins un type d infrastructure' }}
          render={({ field }) => (
            <FormControl error={!!errors.techEcosystem?.clouds}>
              <FormLabel>Infrastructure</FormLabel>
              <FormGroup row>
                {CLOUDS.map((cloud) => (
                  <FormControlLabel
                    key={cloud}
                    control={
                      <Checkbox
                        checked={field.value.includes(cloud)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            field.onChange([...field.value, cloud]);
                          } else {
                            field.onChange(field.value.filter((v: Cloud) => v !== cloud));
                          }
                        }}
                      />
                    }
                    label={cloud}
                  />
                ))}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={cloudOtherEnabled}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setCloudOtherEnabled(e.target.checked);
                        if (!e.target.checked && cloudOtherValue) {
                          field.onChange(field.value.filter((v: string) => !v.startsWith(OTHER_PREFIX)));
                          setCloudOtherValue('');
                        }
                      }}
                    />
                  }
                  label="Autre"
                />
              </FormGroup>
              {cloudOtherEnabled && (
                <TextField
                  size="small"
                  placeholder="Précisez..."
                  value={cloudOtherValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newValue = e.target.value;
                    setCloudOtherValue(newValue);
                    const filtered = field.value.filter((v: string) => !v.startsWith(OTHER_PREFIX));
                    if (newValue.trim()) {
                      field.onChange([...filtered, `${OTHER_PREFIX}${newValue}`]);
                    } else {
                      field.onChange(filtered);
                    }
                  }}
                  sx={{ mt: 1, maxWidth: 250 }}
                />
              )}
              {errors.techEcosystem?.clouds && (
                <FormHelperText>{errors.techEcosystem.clouds.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        {/* Deployments */}
        <Controller
          name="techEcosystem.deployments"
          control={control}
          defaultValue={[]}
          rules={{ validate: (v) => v.length > 0 || 'Sélectionnez au moins un outil de déploiement' }}
          render={({ field }) => (
            <FormControl error={!!errors.techEcosystem?.deployments}>
              <FormLabel>Outils de Déploiement</FormLabel>
              <FormGroup row>
                {DEPLOYMENTS.map((deployment) => (
                  <FormControlLabel
                    key={deployment}
                    control={
                      <Checkbox
                        checked={field.value.includes(deployment)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            field.onChange([...field.value, deployment]);
                          } else {
                            field.onChange(field.value.filter((v: Deployment) => v !== deployment));
                          }
                        }}
                      />
                    }
                    label={deployment}
                  />
                ))}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={deploymentOtherEnabled}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setDeploymentOtherEnabled(e.target.checked);
                        if (!e.target.checked && deploymentOtherValue) {
                          field.onChange(field.value.filter((v: string) => !v.startsWith(OTHER_PREFIX)));
                          setDeploymentOtherValue('');
                        }
                      }}
                    />
                  }
                  label="Autre"
                />
              </FormGroup>
              {deploymentOtherEnabled && (
                <TextField
                  size="small"
                  placeholder="Précisez..."
                  value={deploymentOtherValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newValue = e.target.value;
                    setDeploymentOtherValue(newValue);
                    const filtered = field.value.filter((v: string) => !v.startsWith(OTHER_PREFIX));
                    if (newValue.trim()) {
                      field.onChange([...filtered, `${OTHER_PREFIX}${newValue}`]);
                    } else {
                      field.onChange(filtered);
                    }
                  }}
                  sx={{ mt: 1, maxWidth: 250 }}
                />
              )}
              {errors.techEcosystem?.deployments && (
                <FormHelperText>{errors.techEcosystem.deployments.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        {/* Ticket Managers */}
        <Controller
          name="techEcosystem.ticketManagers"
          control={control}
          defaultValue={[]}
          rules={{ validate: (v) => v.length > 0 || 'Sélectionnez au moins un outil de gestion de tickets' }}
          render={({ field }) => (
            <FormControl error={!!errors.techEcosystem?.ticketManagers}>
              <FormLabel>Gestion de tickets</FormLabel>
              <FormGroup row>
                {TICKET_MANAGERS.map((ticketManager) => (
                  <FormControlLabel
                    key={ticketManager}
                    control={
                      <Checkbox
                        checked={field.value.includes(ticketManager)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            field.onChange([...field.value, ticketManager]);
                          } else {
                            field.onChange(field.value.filter((v: TicketManager) => v !== ticketManager));
                          }
                        }}
                      />
                    }
                    label={ticketManager}
                  />
                ))}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={ticketManagerOtherEnabled}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setTicketManagerOtherEnabled(e.target.checked);
                        if (!e.target.checked && ticketManagerOtherValue) {
                          field.onChange(field.value.filter((v: string) => !v.startsWith(OTHER_PREFIX)));
                          setTicketManagerOtherValue('');
                        }
                      }}
                    />
                  }
                  label="Autre"
                />
              </FormGroup>
              {ticketManagerOtherEnabled && (
                <TextField
                  size="small"
                  placeholder="Précisez..."
                  value={ticketManagerOtherValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newValue = e.target.value;
                    setTicketManagerOtherValue(newValue);
                    const filtered = field.value.filter((v: string) => !v.startsWith(OTHER_PREFIX));
                    if (newValue.trim()) {
                      field.onChange([...filtered, `${OTHER_PREFIX}${newValue}`]);
                    } else {
                      field.onChange(filtered);
                    }
                  }}
                  sx={{ mt: 1, maxWidth: 250 }}
                />
              )}
              {errors.techEcosystem?.ticketManagers && (
                <FormHelperText>{errors.techEcosystem.ticketManagers.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        {/* Monitoring Tools */}
        <Controller
          name="techEcosystem.monitoringTools"
          control={control}
          defaultValue={[]}
          rules={{ validate: (v) => v.length > 0 || 'Sélectionnez au moins un outil de monitoring' }}
          render={({ field }) => (
            <FormControl error={!!errors.techEcosystem?.monitoringTools}>
              <FormLabel>Monitoring</FormLabel>
              <FormGroup row>
                {MONITORING_TOOLS.map((monitoringTool) => (
                  <FormControlLabel
                    key={monitoringTool}
                    control={
                      <Checkbox
                        checked={field.value.includes(monitoringTool)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            field.onChange([...field.value, monitoringTool]);
                          } else {
                            field.onChange(field.value.filter((v: MonitoringTool) => v !== monitoringTool));
                          }
                        }}
                      />
                    }
                    label={monitoringTool}
                  />
                ))}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={monitoringOtherEnabled}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setMonitoringOtherEnabled(e.target.checked);
                        if (!e.target.checked && monitoringOtherValue) {
                          field.onChange(field.value.filter((v: string) => !v.startsWith(OTHER_PREFIX)));
                          setMonitoringOtherValue('');
                        }
                      }}
                    />
                  }
                  label="Autre"
                />
              </FormGroup>
              {monitoringOtherEnabled && (
                <TextField
                  size="small"
                  placeholder="Précisez..."
                  value={monitoringOtherValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const newValue = e.target.value;
                    setMonitoringOtherValue(newValue);
                    const filtered = field.value.filter((v: string) => !v.startsWith(OTHER_PREFIX));
                    if (newValue.trim()) {
                      field.onChange([...filtered, `${OTHER_PREFIX}${newValue}`]);
                    } else {
                      field.onChange(filtered);
                    }
                  }}
                  sx={{ mt: 1, maxWidth: 250 }}
                />
              )}
              {errors.techEcosystem?.monitoringTools && (
                <FormHelperText>{errors.techEcosystem.monitoringTools.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
      </Box>
    </Box>
  );
}
