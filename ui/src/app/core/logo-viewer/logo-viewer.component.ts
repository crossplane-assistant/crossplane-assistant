import { Component, Input, OnInit } from '@angular/core';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-logo-viewer',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './logo-viewer.component.html',
  styleUrl: './logo-viewer.component.scss',
})
export class LogoViewerComponent implements OnInit {
  kindLogo: string | undefined;
  kindInitials: string | undefined;
  kindInitialsFontSize: number = 1.3;

  _apiVersion: string | undefined;
  @Input()
  kind: string | undefined;

  ngOnInit(): void {
    this.init();
  }

  init() {
    this.kindLogo = this.getLogo();
    this.kindInitials = this.getInitials();
    if (this.kindInitials.length > 1) {
      this.kindInitialsFontSize = (1.2 / this.kindInitials.length) * 2;
    }
  }

  @Input()
  set apiVersion(apiVersion: string | undefined) {
    this._apiVersion = apiVersion;
    this.init();
  }
  get apiVersion(): string | undefined {
    return this._apiVersion;
  }

  getInitials(): string {
    if (this.kind) {
      return this.kind.replace(/[^A-Z]+/g, '');
    }
    return '';
  }

  getLogo(): string {
    if (!this.apiVersion) {
      return '';
    }

    if (this.apiVersion.startsWith('kubernetes.crossplane.io')) {
      return '/assets/logo/kubernetes.png';
    }
    if (this.apiVersion.includes('gcp.')) {
      return '/assets/logo/gcp.png';
    }
    if (this.apiVersion.includes('gcp.m.upbound.io')) {
      return '/assets/logo/gcp.png';
    }
    if (this.apiVersion.indexOf('gcp.upbound.io') >= 0) {
      return '/assets/logo/gcp.png';
    }
    if (this.apiVersion.indexOf('cloudplatform.gcp.m.upbound.io') >= 0) {
      return '/assets/logo/gcp.png';
    }
    if (this.apiVersion.indexOf('pubsub.gcp.m.upbound.io') >= 0) {
      return '/assets/logo/gcp.png';
    }
    if (this.apiVersion.indexOf('gcp.crossplane.io') >= 0) {
      return '/assets/logo/gcp.png';
    }
    if (this.apiVersion.startsWith('azure.crossplane.io')) {
      return '/assets/logo/azure.png';
    }
    if (this.apiVersion.startsWith('aws.crossplane.io')) {
      return '/assets/logo/aws.png';
    }
    if (this.apiVersion.startsWith('postgresql.sql.crossplane.io')) {
      return '/assets/logo/postgresql.png';
    }
    if (this.apiVersion.startsWith('aiven.io')) {
      return '/assets/logo/aiven.png';
    }
    if (this.apiVersion.startsWith('external-secrets.io')) {
      return '/assets/logo/external-secrets.png';
    }
    if (this.apiVersion.startsWith('tf.upbound.io')) {
      return '/assets/logo/terraform.png';
    }
    if (this.apiVersion.startsWith('externaldns.k8s.io')) {
      return '/assets/logo/external-dns.png';
    }
    if (this.apiVersion.startsWith('atlas.mongodb.com')) {
      return '/assets/logo/mongodb.png';
    }
    if (this.apiVersion.indexOf('upbound.io') >= 0) {
      return '/assets/logo/generic.png';
    }

    return '';
  }
}
