package com.example.childPortal.dto;
  import java.time.LocalDateTime;

public class CaseTrendDTO {
  private LocalDateTime period; 
  private long newCases;
  private long resolvedCases; 
  private long activeCases; 
  private double resolutionRate;

  public LocalDateTime getPeriod() {
    return period; 
  }
  public void setPeriod(LocalDateTime period) { 
    this.period = period;
  } 
  public long getNewCases() { 
    return newCases;
  }
  public void setNewCases(long newCases) { 
    this.newCases = newCases; 
  } 
  public long getResolvedCases() { 
    return resolvedCases; 
  }
  public void setResolvedCases(long resolvedCases) { 
    this.resolvedCases = resolvedCases; 
  }
  public long getActiveCases() { 
    return activeCases; 
  }
  public void setActiveCases(long activeCases) { 
    this.activeCases = activeCases; 
  } 
  public double getResolutionRate() {
    return resolutionRate; 
  }
  public void setResolutionRate(double resolutionRate) { 
    this.resolutionRate = resolutionRate; 
  }
}
