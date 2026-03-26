import { QueryHandler } from '@lotchen/api/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CaptureConfigProvider } from '../capture-config.provider';

export class GenerateScriptQuery {
  id!: string;
}

export class GenerateScriptResponse {
  @ApiProperty()
  script!: string;
}

@Injectable()
export class GenerateScriptQueryHandler
  implements QueryHandler<GenerateScriptQuery, GenerateScriptResponse>
{
  constructor(private readonly provider: CaptureConfigProvider) {}

  async handlerAsync(
    query: GenerateScriptQuery
  ): Promise<GenerateScriptResponse> {
    const config = await this.provider.CaptureConfigModel.findOne({
      _id: query.id,
      deletedAt: null,
    })
      .lean()
      .exec();

    if (!config) {
      throw new NotFoundException('Configuration de capture introuvable');
    }

    const tenantFqdn =
      (this.provider.request as any)?.tenant_fqdn ?? 'YOUR_TENANT';

    const script = this.buildScript(config.apiKey, tenantFqdn);

    return { script };
  }

  private buildScript(apiKey: string, tenantFqdn: string): string {
    const lines = [
      '<!-- Lotchen Lead Capture Script -->',
      '<script>',
      '(function() {',
      `  var LOTCHEN_API_KEY = "${apiKey}";`,
      `  var LOTCHEN_TENANT = "${tenantFqdn}";`,
      '  var LOTCHEN_ENDPOINT = "/api/v1/leads/capture";',
      '',
      '  window.LotchenCapture = {',
      '    submit: function(formData) {',
      '      var payload = {',
      '        source: "Website",',
      '        apiKey: LOTCHEN_API_KEY,',
      '        firstName: formData.firstName || "",',
      '        lastName: formData.lastName || "",',
      '        email: formData.email || "",',
      '        mobileNumber: formData.mobileNumber || formData.phone || "",',
      '        formData: formData',
      '      };',
      '',
      '      var xhr = new XMLHttpRequest();',
      '      xhr.open("POST", LOTCHEN_ENDPOINT, true);',
      '      xhr.setRequestHeader("Content-Type", "application/json");',
      '      xhr.setRequestHeader("x-tenant-fqdn", LOTCHEN_TENANT);',
      '      xhr.send(JSON.stringify(payload));',
      '',
      '      return new Promise(function(resolve, reject) {',
      '        xhr.onload = function() {',
      '          if (xhr.status >= 200 && xhr.status < 300) {',
      '            resolve({ success: true });',
      '          } else {',
      '            reject({ success: false, status: xhr.status });',
      '          }',
      '        };',
      '        xhr.onerror = function() {',
      '          reject({ success: false, error: "Network error" });',
      '        };',
      '      });',
      '    }',
      '  };',
      '})();',
      '</script>',
    ];
    return lines.join('\n');
  }
}
