package gui

import (
	"config"
	"core"
	"fmt"
	"os"

	"github.com/gotk3/gotk3/glib"
	"github.com/gotk3/gotk3/gtk"
)

func createWindow(title string, width, height int) *gtk.Window {
	if config.DEBUGGING {
		defer core.StartBenchmark("gui.createWindow() ("+title+")", false).Stop()
	}
	// Create a new top-level window.
	win, err := gtk.WindowNew(gtk.WINDOW_TOPLEVEL)
	core.ErrorsHandler(err)
	// Set the title of the window.
	win.SetTitle(title)
	// Set the default size of the window.
	win.SetDefaultSize(width, height)
	return win
}

func setWindowIcon(win *gtk.Window) {
	if config.DEBUGGING {
		defer core.StartBenchmark("gui.setWindowIcon()", false).Stop()
	}
	if _, err := os.Stat(config.LOGO_PATH); err == nil {
		win.SetIconFromFile(config.LOGO_PATH)
	}
}

func createLabel(s string) *gtk.Label {
	if config.DEBUGGING {
		defer core.StartBenchmark("gui.createLabel() ("+s+")", false).Stop()
	}
	label, err := gtk.LabelNew(s)
	core.ErrorsHandler(err)
	return label
}

func createBox(orientation gtk.Orientation, spacing int) *gtk.Box {
	if config.DEBUGGING {
		defer core.StartBenchmark("gui.createBox()", false).Stop()
	}
	box, err := gtk.BoxNew(orientation, spacing)
	core.ErrorsHandler(err)
	return box
}

func createButton(s string) *gtk.Button {
	if config.DEBUGGING {
		defer core.StartBenchmark("gui.createButton() ("+s+")", false).Stop()
	}
	button, err := gtk.ButtonNewWithLabel(s)
	core.ErrorsHandler(err)
	return button
}

func createCheckBoxes(labels ...string) []*gtk.CheckButton {
	if config.DEBUGGING {
		defer core.StartBenchmark("gui.createCheckBoxes()", false).Stop()
	}
	checkboxes := []*gtk.CheckButton{}
	for i, label := range labels {
		cb, err := gtk.CheckButtonNewWithLabel(label)
		core.ErrorsHandler(err)
		// Initialize checkboxes.
		cb = core.InitFilters(i, cb)
		checkboxes = append(checkboxes, cb)
		// Connect all checkboxes.
		cb.Connect("toggled", func() {
			// If a checkbox is toggled change the filters.
			core.SetFilters(checkboxes)
			UpdateView()
		})
	}
	return checkboxes
}

func createProgressBar() *gtk.ProgressBar {
	if config.DEBUGGING {
		defer core.StartBenchmark("gui.createProgressBar()", false).Stop()
	}
	progressBar, err := gtk.ProgressBarNew()
	core.ErrorsHandler(err)
	progressBar.SetShowText(true)
	progressBar.SetFraction(core.AnalysisState.Progress)
	progressBar.SetText(fmt.Sprintf("%d / %d", core.AnalysisState.Current, core.AnalysisState.Total))
	progressBar.SetSizeRequest(20, -1)
	// Update periodically the progressbar.
	glib.TimeoutAdd(100, func() bool {
		progressBar.SetFraction(core.AnalysisState.Progress)
		progressBar.SetText(fmt.Sprintf("%d / %d", core.AnalysisState.Current, core.AnalysisState.Total))
		return core.AnalysisState.InProgress
	})
	return progressBar
}

func createSpinButton() *gtk.SpinButton {
	if config.DEBUGGING {
		defer core.StartBenchmark("gui.createSpinButton()", false).Stop()
	}
	spinButton, err := gtk.SpinButtonNewWithRange(0, float64(len(core.XlsmDeltas)), 1)
	core.ErrorsHandler(err)
	// Set default value
	spinButton.SetValue(float64(core.Filters.Header))
	// Connect the "value-changed" signal
	spinButton.Connect("value-changed", func() {
		value := spinButton.GetValue()
		core.Filters.Header = int(value)
		// Generate delta data.
		core.XlsmDiff()
		UpdateView()
	})
	return spinButton
}

func createScrolledWindow() *gtk.ScrolledWindow {
	if config.DEBUGGING {
		defer core.StartBenchmark("gui.createScrolledWindow()", false).Stop()
	}
	scrolledWindow, err := gtk.ScrolledWindowNew(nil, nil)
	core.ErrorsHandler(err)
	scrolledWindow.SetPolicy(config.SCROLLBAR_POLICY, config.SCROLLBAR_POLICY)
	scrolledWindow.Add(resultView)
	scrolledWindow.SetVExpand(true)
	scrolledWindow.SetHExpand(true)
	// Enlarge scrollbars.
	EnlargeSb()
	return scrolledWindow
}
