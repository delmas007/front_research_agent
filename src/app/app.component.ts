import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Editor} from 'primeng/editor';
import {ButtonDirective} from 'primeng/button';
import {SpeedDial} from 'primeng/speeddial';
import {Toast} from 'primeng/toast';
import {MenuItem, MessageService} from 'primeng/api';
import { NzInputModule } from 'ng-zorro-antd/input';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {BaseService} from './core/service/base.service';
import {Dialog} from 'primeng/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Editor, ButtonDirective, SpeedDial, Toast, NzInputModule, FormsModule, CommonModule, Dialog],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [MessageService]

})
export class AppComponent {
  title = 'delmas';
  items!: MenuItem[];
  inputText = '';
  userText = '';
  responseText = '';
  isLoading: boolean = false;
  pdfBlob: Blob | null = null;
  showPdfViewer = false;
  pdfBlobUrl: SafeResourceUrl | null = null;
  pdfFilename: string = '';
  pdfSize: number = 0;

  constructor(
    private messageService: MessageService,
    private baseService: BaseService,
    private sanitizer: DomSanitizer

  ) {}

  ngOnInit() {
    this.items = [
      {
        icon: 'pi pi-download',
        command: () => {
          if (this.pdfBlob) {
            const blobUrl = URL.createObjectURL(this.pdfBlob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = 'mon_fichier.pdf'; // ou un nom dynamique
            a.click();
            URL.revokeObjectURL(blobUrl); // nettoyage
          } else {
            this.messageService.add({ severity: 'warn', summary: 'Aucun fichier', detail: 'Aucun PDF à télécharger.' });
          }
        }
      },
      {
        icon: 'pi pi-eye',
        command: () => {
          if (this.pdfBlob) {
            const blobUrl = URL.createObjectURL(this.pdfBlob);
            this.pdfBlobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl) as SafeResourceUrl;
            this.showPdfViewer = true;
          } else {
            this.messageService.add({ severity: 'warn', summary: 'Aucun fichier', detail: 'Aucun PDF à afficher.' });
          }
        }
      },
      {
        icon: 'pi pi-share-alt',
        command: () => {
          this.sharePdf('whatsapp');
        }
      },
    ];
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendPrompt();
    }
  }
  sendPrompt() {
    if (this.inputText.trim() && !this.isLoading) {
      this.userText = this.inputText;
      this.inputText = '';
      this.isLoading = true;

      const data = { prompt: this.userText };

      this.baseService.post(data).subscribe({
        next: (response) => {
          const contentDisposition = response.headers.get('Content-Disposition');
          console.log(response.headers)
          let filename = 'fichier.pdf';
          if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match && match[1]) {

              filename = match[1];
            }
          }

          this.pdfBlob = response.body;
          if (this.pdfBlob) {
            this.pdfSize = Math.round((this.pdfBlob.size / 1024) * 100) / 100; // arrondi Ko
            this.pdfFilename = filename;
            this.responseText = `Voici le document PDF généré par DELMASIA`;
            const objectUrl = URL.createObjectURL(this.pdfBlob);
            this.pdfBlobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
          }
          this.isLoading = false;
        },
        error: () => {
          this.responseText = "Erreur lors de la génération du PDF.";
          this.isLoading = false;
        }
      });
    }
  }

  sharePdf(platform: string) {
    if (!this.pdfBlob) {
      this.messageService.add({ severity: 'warn', summary: 'Aucun fichier', detail: 'Aucun PDF à partager.' });
      return;
    }

    const blobUrl = URL.createObjectURL(this.pdfBlob);
    const encodedUrl = encodeURIComponent(blobUrl);
    const text = encodeURIComponent("Voici le document PDF généré par DELMASIA");

    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%0A${encodedUrl}`;
        break;
      case 'slack':
        // Slack ne permet pas le partage direct via URL — redirige vers l'app web
        shareUrl = `https://slack.com/app_redirect?channel=general`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'twitter':
      case 'x':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  }


  onDialogHide() {
    this.pdfBlobUrl = null;
  }
}
