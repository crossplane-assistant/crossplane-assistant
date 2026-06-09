package kubernetes

import (
	"path/filepath"

	"github.com/rs/zerolog/log"
	"k8s.io/cli-runtime/pkg/genericclioptions"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/util/homedir"
)

func GetkubeConfig() (*rest.Config, error) {

	// Check if we are running in a k8s cluster
	config, err := rest.InClusterConfig()
	if err == nil {
		return config, nil
	}

	// If not, use the kubeconfig file
	k8sFlags := genericclioptions.NewConfigFlags(false)
	var home = homedir.HomeDir()
	configPath := filepath.Join(home, ".kube/config")
	k8sFlags.KubeConfig = &configPath

	return k8sFlags.ToRawKubeConfigLoader().ClientConfig()
}

func KubernetesDynamicClient() (*dynamic.DynamicClient, error) {

	config, err := GetkubeConfig()
	if err != nil {
		log.Fatal().Err(err).Msg("Error getting config")
	}

	dynamicClient, err := dynamic.NewForConfig(config)
	if err != nil {
		log.Fatal().Err(err).Msg("Error creating dynamic client")
	}

	return dynamicClient, nil
}
