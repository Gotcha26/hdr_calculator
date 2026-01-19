// version.js - Récupération automatique des infos Git depuis GitHub

const versionInfo = {
  major: 1,
  minor: 0,
  repoOwner: "Gotcha26",
  repoName: "hdr_calculator",
  branch: "dev", // ou "main"
  
  // Cache pour éviter trop de requêtes
  cachedInfo: null,
  
  // Récupérer les infos depuis GitHub API
  async fetchGitInfo() {
    if (this.cachedInfo) {
      return this.cachedInfo;
    }
    
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/commits/${this.branch}`
      );
      
      if (!response.ok) throw new Error('GitHub API error');
      
      const data = await response.json();
      const commitDate = new Date(data.commit.committer.date);
      const shortHash = data.sha.substring(0, 7);
      
      // Format date AAMMJJ
      const dateStr = commitDate.toLocaleDateString('fr-FR', {
        year: '2-digit',
        month: '2-digit', 
        day: '2-digit'
      }).replace(/\//g, '');
      
      this.cachedInfo = {
        hash: shortHash,
        date: dateStr,
        fullDate: commitDate
      };
      
      return this.cachedInfo;
    } catch (error) {
      console.warn('Impossible de récupérer les infos Git:', error);
      // Valeurs par défaut si échec
      return {
        hash: 'local',
        date: new Date().toLocaleDateString('fr-FR', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\//g, '')
      };
    }
  },
  
  // Format pour le menu
  async getFullVersion() {
    const info = await this.fetchGitInfo();
    return `${this.major}.${this.minor} ${this.branch} ${info.date}`;
  },
  
  // Format avec hash
  async getVersionWithHash() {
    const info = await this.fetchGitInfo();
    return `${this.major}.${this.minor} ${this.branch} ${info.hash}`;
  },
  
  // Format court pour footer
  async getShortVersion() {
    const info = await this.fetchGitInfo();
    return `v${this.major}.${this.minor} ${this.branch} ${info.date}`;
  }
};