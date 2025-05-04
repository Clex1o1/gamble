export interface IApiService {
    getBtcPrice(): Promise<string>;
}

export class ApiService implements IApiService {
    async getBtcPrice(): Promise<string> {
        return fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot')
            .then(response => response.json())
            .then(data => data.data.amount);
    }
}
