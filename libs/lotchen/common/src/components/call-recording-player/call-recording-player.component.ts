import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  signal,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ButtonModule } from '@talisoft/ui/button';
import { TasIcon } from '@talisoft/ui/icon';

@Component({
  selector: 'common-call-recording-player',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [ButtonModule, TasIcon],
  template: `
    @if (recordingUrl()) {
    <div class="flex items-center space-x-2">
      <button tas-text-button iconButton (click)="togglePlay()" class="!p-1">
        <tas-icon
          [iconName]="isPlaying() ? 'feather:pause' : 'feather:play'"
          iconSize="sm"
        ></tas-icon>
      </button>
      <audio
        #audioPlayer
        [src]="recordingUrl()"
        (ended)="isPlaying.set(false)"
        (timeupdate)="onTimeUpdate()"
      ></audio>
      <span class="text-xs text-gray-500">{{ formattedTime() }}</span>
    </div>
    }
  `,
})
export class CallRecordingPlayerComponent {
  recordingUrl = input<string>('');
  isPlaying = signal(false);
  formattedTime = signal('0:00');

  @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;

  togglePlay() {
    const audio = this.audioPlayerRef?.nativeElement;
    if (!audio) return;

    if (this.isPlaying()) {
      audio.pause();
      this.isPlaying.set(false);
    } else {
      audio.play();
      this.isPlaying.set(true);
    }
  }

  onTimeUpdate() {
    const audio = this.audioPlayerRef?.nativeElement;
    if (!audio) return;
    const mins = Math.floor(audio.currentTime / 60);
    const secs = Math.floor(audio.currentTime % 60);
    this.formattedTime.set(`${mins}:${secs.toString().padStart(2, '0')}`);
  }
}
