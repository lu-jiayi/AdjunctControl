this.dir <- dirname(rstudioapi::getSourceEditorContext()$path)
setwd(this.dir)

library(plyr)
library(dplyr)
library(reshape)
library(ggplot2)
library(gtable)
library(lme4)
library(tidyverse)
library(lmerTest)
library(bootstrap)
library(ggpubr)
library(stringr)
library(brms)
library(BayesFactor)
`%notin%` <- Negate(`%in%`)

theta <- function(x, xdata, na.rm = TRUE) {
  mean(xdata[x], na.rm = na.rm)
}

ci.low <- function(x, na.rm = TRUE) {
  mean(x, na.rm = na.rm) -
    quantile(
      bootstrap::bootstrap(1:length(x), 1000, theta, x, na.rm = na.rm)$thetastar,
      .025,
      na.rm = na.rm
    )
}

ci.high <- function(x, na.rm = TRUE) {
  quantile(
    bootstrap::bootstrap(1:length(x), 1000, theta, x, na.rm = na.rm)$thetastar,
    .975,
    na.rm = na.rm
  ) - mean(x, na.rm = na.rm)
}
########################################33
raw_data_path <- "data_batch1.csv"
data<-read.csv(raw_data_path)
critical_data <- data %>%
  filter(type == "critical") %>%
  group_by(workerid, trial_id, trial_no) %>%
  mutate(
    critical_idx = word_idx[region == "critical"][1],
    
    condition_voice = if_else(
      any(region == "spillover_2" & form == "be", na.rm = TRUE),
      "passive",
      "active"
    ),
    
    condition_pronoun = if_else(
      any(form %in% c("he", "she", "they") & word_idx < critical_idx, na.rm = TRUE),
      "yes",
      "no"
    )
  ) %>%
  select(-critical_idx) %>%
  ungroup()


roi_data <- critical_data %>%
  filter(region != 0) %>%
  filter(
   rt >= 100,
    rt <= 3000
  )


roi_summary <- roi_data %>%
  group_by(region, condition_voice, condition_pronoun) %>%
  summarise(
    Mean = mean(rt, na.rm = TRUE),
    CILow = Mean - ci.low(rt),
    CIHigh = Mean + ci.high(rt),
    .groups = "drop"
  )


roi_plot <- ggplot(
  roi_summary,
  aes(x = condition_voice,
      y = Mean,
      fill = condition_pronoun)
) +
  geom_col(
    position = position_dodge(width = 0.8),
    width = 0.7
  ) +
  geom_errorbar(
    aes(ymin = CILow, ymax = CIHigh),
    position = position_dodge(width = 0.8),
    width = 0.25,
    linewidth = 0.8
  ) +
  facet_wrap(~ region) +
  labs(
    x = "Voice",
    y = "Reading time (ms)",
    fill = "Pronoun"
  ) +
  theme_bw() +
  theme(
    strip.text = element_text(size = 14, face = "bold"),
    axis.title = element_text(size = 14),
    axis.text = element_text(size = 12),
    legend.title = element_text(size = 13),
    legend.text = element_text(size = 12),
    legend.position = "bottom"
  )

roi_plot
