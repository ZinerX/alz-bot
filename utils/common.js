export let queue = [];

export const fetchWorldState = async () => { 
    const response = await fetch('https://content.warframe.com/dynamic/worldState.php', {
        method: "GET",
    });
    if (!response.ok) { 
        throw new Error(`Failed to fetch world state: ${response.status} ${response.statusText}`);
    }
    const worldState = await response.json();
    return worldState;
}


export const fetchWorldStateWFCD = async () => { 
    const response = await fetch('https://api.warframestat.us/pc/', {
        method: "GET",
    });
    if (!response.ok) { 
        throw new Error(`Failed to fetch world state: ${response.status} ${response.statusText}`);
    }
    const worldState = await response.json();
    return worldState;
}