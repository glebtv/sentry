from __future__ import absolute_import

from sentry.utils import json
from sentry.utils.signing import unsign

from sentry.web.frontend.integration_extension_configuration import (
    IntegrationExtensionConfigurationView,
)

# 24 hours to finish installation
INSTALL_EXPIRATION_TIME = 60 * 60 * 24


class JiraExtensionConfigurationView(IntegrationExtensionConfigurationView):
    provider = "jira"
    external_provider_key = "jira"

    @property
    def configure_path(self):
        return u"/extensions/{}/extension-configuration/".format(self.provider)

    def map_params_to_state(self, params):
        # decode the signed params and add them to whatever params we have
        params = params.copy()
        signed_params = params["signed_params"]
        del params["signed_params"]
        params.update(unsign(signed_params, max_age=INSTALL_EXPIRATION_TIME,))
        params["metadata"] = json.loads(params["metadata"])
        return params