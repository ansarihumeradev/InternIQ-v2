import { Job, Internship } from '../types/job';
import ScraperService from './scraperService';

class BackgroundService {
  private static instance: BackgroundService;
  private scraperService: ScraperService;
  private updateInterval: number = 24 * 60 * 60 * 1000; // 24 hours
  private lastUpdate: Date | null = null;
  private isRunning: boolean = false;

  private constructor() {
    this.scraperService = ScraperService.getInstance();
    this.loadLastUpdate();
  }

  public static getInstance(): BackgroundService {
    if (!BackgroundService.instance) {
      BackgroundService.instance = new BackgroundService();
    }
    return BackgroundService.instance;
  }

  private loadLastUpdate(): void {
    try {
      const saved = localStorage.getItem('fresherJobs_lastBackgroundUpdate');
      if (saved) {
        this.lastUpdate = new Date(saved);
      }
    } catch (error) {
      console.error('Error loading last background update:', error);
    }
  }

  private saveLastUpdate(): void {
    this.lastUpdate = new Date();
    localStorage.setItem('fresherJobs_lastBackgroundUpdate', this.lastUpdate.toISOString());
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Background service is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting background service for job updates...');

    // Initial update
    await this.performUpdate();

    // Set up periodic updates
    setInterval(async () => {
      if (this.shouldUpdate()) {
        await this.performUpdate();
      }
    }, this.updateInterval);

    // Also check every hour if we should update
    setInterval(async () => {
      if (this.shouldUpdate()) {
        await this.performUpdate();
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  private shouldUpdate(): boolean {
    if (!this.lastUpdate) return true;
    const now = new Date();
    const timeDiff = now.getTime() - this.lastUpdate.getTime();
    return timeDiff >= this.updateInterval;
  }

  private async performUpdate(): Promise<void> {
    try {
      console.log('Performing background job and internship update...');
      
      // Update jobs using scraper service
      const jobs = await this.scraperService.scrapeJobs();
      console.log(`Background service updated ${jobs.length} jobs`);
      
      // Update internships using scraper service
      const internships = await this.scraperService.scrapeInternships();
      console.log(`Background service updated ${internships.length} internships`);
      
      this.saveLastUpdate();
      
      // Show notification to user if they're online
      if (navigator.onLine) {
        this.showUpdateNotification(jobs.length, internships.length);
      }
      
      console.log('Background update completed successfully');
    } catch (error) {
      console.error('Background update failed:', error);
    }
  }

  private showUpdateNotification(jobCount: number, internshipCount: number): void {
    // Create a custom event to notify the app
    const event = new CustomEvent('backgroundUpdate', {
      detail: {
        jobCount,
        internshipCount,
        timestamp: new Date().toISOString()
      }
    });
    
    window.dispatchEvent(event);
  }

  public async forceUpdate(): Promise<void> {
    console.log('Forcing background update...');
    await this.performUpdate();
  }

  public stop(): void {
    this.isRunning = false;
    console.log('Background service stopped');
  }

  public getLastUpdateTime(): Date | null {
    return this.lastUpdate;
  }

  public getNextUpdateTime(): Date | null {
    if (!this.lastUpdate) return null;
    return new Date(this.lastUpdate.getTime() + this.updateInterval);
  }

  public setUpdateInterval(hours: number): void {
    this.updateInterval = hours * 60 * 60 * 1000;
    console.log(`Background update interval set to ${hours} hours`);
  }

  public isServiceRunning(): boolean {
    return this.isRunning;
  }
}

export default BackgroundService; 