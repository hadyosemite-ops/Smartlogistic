/**
 * Hooks domaine — wrappent les services avec loading/error.
 * Usage : const { data: drivers, loading, error } = useDrivers();
 */

import { driverService }      from '../services/driverService';
import { vehicleService }     from '../services/vehicleService';
import { missionService }     from '../services/missionService';
import { alertService }       from '../services/alertService';
import { maintenanceService } from '../services/maintenanceService';
import { financeService }     from '../services/financeService';
import { rhService }          from '../services/rhService';
import { adminService }       from '../services/adminService';
import { checklistService }   from '../services/checklistService';
import { chartService }       from '../services/chartService';
import { useData }            from './useData';

// ─── Drivers ─────────────────────────────────────────────────
export const useDrivers    = () => useData(() => driverService.getAll());
export const useDriver     = (id: string) => useData(() => driverService.getById(id), [id]);

// ─── Vehicles ────────────────────────────────────────────────
export const useVehicles   = () => useData(() => vehicleService.getAll());
export const useVehicle    = (id: string) => useData(() => vehicleService.getById(id), [id]);

// ─── Missions ────────────────────────────────────────────────
export const useMissions   = () => useData(() => missionService.getAll());

// ─── Alerts ──────────────────────────────────────────────────
export const useAlerts     = () => useData(() => alertService.getAll());

// ─── Maintenance ─────────────────────────────────────────────
export const useInterventions     = () => useData(() => maintenanceService.getInterventions());
export const useMaintenanceAlerts = () => useData(() => maintenanceService.getMaintenanceAlerts());
export const useMaintenanceCosts  = () => useData(() => maintenanceService.getCostByMonth());

// ─── Finance ─────────────────────────────────────────────────
export const useVoyageCosts      = () => useData(() => financeService.getVoyageCosts());
export const useClientRevenue    = () => useData(() => financeService.getClientRevenue());
export const useRoutePerf        = () => useData(() => financeService.getRoutePerf());
export const useFinancialByMonth = () => useData(() => financeService.getFinancialByMonth());

// ─── RH ──────────────────────────────────────────────────────
export const useContratsConducteurs = () => useData(() => rhService.getContrats());
export const useConges              = () => useData(() => rhService.getConges());
export const useFormations          = () => useData(() => rhService.getFormations());
export const usePaieMensuelle       = () => useData(() => rhService.getPaieMensuelle());

// ─── Admin ───────────────────────────────────────────────────
export const useDocuments      = () => useData(() => adminService.getDocuments());
export const useContratsClient = () => useData(() => adminService.getContrats());
export const useFactures       = () => useData(() => adminService.getFactures());

// ─── Checklist ───────────────────────────────────────────────
export const useChecklistItems = () => useData(() => checklistService.getItems());
export const useInspections    = () => useData(() => checklistService.getInspections());
export const useActions        = () => useData(() => checklistService.getActions());

// ─── Charts ──────────────────────────────────────────────────
export const useActivityData    = () => useData(() => chartService.getActivityData());
export const useFuelData        = () => useData(() => chartService.getFuelData());
export const useIncidentData    = () => useData(() => chartService.getIncidentData());
export const useConformiteTrend = () => useData(() => chartService.getConformiteTrend());
export const useQseData         = () => useData(() => chartService.getQseData());
