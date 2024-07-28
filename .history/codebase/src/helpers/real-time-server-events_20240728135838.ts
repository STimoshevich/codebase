import { Injectable, OnDestroy } from '@angular/core';
import {
  HttpTransportType,
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from '@microsoft/signalr';
import { OAuthService } from 'angular-oauth2-oidc';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { env } from '../../../../environments/env';

@Injectable({
  providedIn: 'root',
})
export class RealTimeServerEventsService implements OnDestroy {
  private readonly _notificationsHubConnection: HubConnection;
  constructor(private _authService: OAuthService) {
    this._notificationsHubConnection = new HubConnectionBuilder()
      .withUrl(`${env.ApisDefaultUri}/real-time-notifications`, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
        accessTokenFactory: () => this._authService.getAccessToken(),
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds(): number | null {
          return 30000;
        },
      })
      .configureLogging(LogLevel.None)
      .build();

    this._notificationsHubConnection
      .start()
      .catch((err) =>
        console.error(`Error while starting connection: ${String(err)}`)
      );
  }

  public ngOnDestroy(): void {
    void this._notificationsHubConnection.stop().then();
  }

  public registerOn<T>(methodName: string): Observable<T> {
    return new Observable<T>((observer) => {
      this._notificationsHubConnection.on(methodName, (x) => {
        observer.next(x as T);
      });
    }).pipe(
      finalize(() => {
        this._notificationsHubConnection.off(methodName);
      })
    );
  }
}
